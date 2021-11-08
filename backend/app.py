import os
import json
import threading
from datetime import datetime, timedelta
from helpers import get_current_time

from dotenv import load_dotenv
load_dotenv()

from flask import Flask, Response, request
from flask_cors import CORS
from flask_caching import Cache
from flask_pymongo import PyMongo
from flask_socketio import SocketIO, send, emit

# from tickers import ticker_list, uppercase_tickers
from reddit import reddit, subreddits_to_monitor, get_thread_info, should_filter
from textblob import TextBlob

elog = open('error.log', 'w')

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.environ.get("mongo_URI")
mongo_URI = os.environ.get("mongo_URI")
app.config["MONGO_URI"] =  mongo_URI
cache = Cache(app,config={'CACHE_TYPE': 'SimpleCache'})
mongo = PyMongo(app)
socketio = SocketIO(app, cors_allowed_origins="*")

SSL_fullchain_path = os.environ.get("SSL_fullchain_path")
SSL_privatekey_path = os.environ.get("SSL_privatekey_path")
SSL_context = None if SSL_fullchain_path is None or SSL_privatekey_path is None else (SSL_fullchain_path, SSL_privatekey_path)

# @app.route('/tickerlist')
# def tickerlist():
    # convert the set to an list(array) so that it can be serialized
    # JSON does not support sets
    # return json.dumps(list(ticker_list))

# @app.route('/tickerlist_uppercase')
# def tickerlist_uppercase():
#     return json.dumps(list(uppercase_tickers))
@app.route('/')
def home():
    return 'Hello World!'

# cache the function for 3 seconds to avoid excessive requests
@cache.memoize(3)
def getStoredTickers(hours_to_get):
    current_time_str = get_current_time()
    document = {}

    # get oldest timeframe we would query
    timeframe_cutoff = (current_time_str) - timedelta(hours=max(hours_to_get-1, 0))

    # query all ticker lists until cut off date
    document = mongo.db.tickers.find(
        { f'time': {'$gte': timeframe_cutoff}  }
    )
    document = list(document)
    if len(document) == 0:
        return json.dumps(None)
    
    # combine all timeframe's data
    tickers_combined = {}
    
    for timeframe in document:
        for tickerName in timeframe['tickers']:
            ticker_info =  timeframe['tickers'][tickerName]
            if tickerName not in tickers_combined:
                tickers_combined[tickerName] = {
                    "name": tickerName,
                    "mentions": 0,
                    "sentiment": 0,
                    "positive_count": 0,
                    "negative_count": 0,
                    "neutral_count": 0,
                }

            tickers_combined[tickerName]['mentions'] += ticker_info['mentions']
            tickers_combined[tickerName]['sentiment'] = (tickers_combined[tickerName]['mentions'] * tickers_combined[tickerName]['sentiment'] + ticker_info['mentions'] * ticker_info['sentiment']) / tickers_combined[tickerName]['mentions']
            tickers_combined[tickerName]['positive_count'] += ticker_info['positive_count'] 
            tickers_combined[tickerName]['negative_count'] += ticker_info['negative_count'] 
            tickers_combined[tickerName]['neutral_count'] += ticker_info['neutral_count'] 

    return list(tickers_combined.values())

@app.route('/stats')
def returnStats():
    hours_to_query  = int(request.args.get('hours') or 0)

    if hours_to_query == 0:
        document = mongo.db.tickers.find_one(
            { 'time': { '$gte': current_time_str} }
        )
        # return tickers in the found document, or none
        return json.dumps(document.get('tickers', None), default=str)
    else:
        tickers = getStoredTickers(hours_to_query)

        return json.dumps(tickers)

    

@app.route('/last_thread')
def returnLastThread():
    last_thread = mongo.db.last_thread.find_one({})
    return json.dumps(last_thread, default=str)

def flask_thread():
    socketio.run(app, host='0.0.0.0', ssl_context=SSL_context)

def reddit_thread():
    subreddit = reddit.subreddit('+'.join(subreddits_to_monitor))
    comment_stream = subreddit.stream.comments(pause_after=-1, skip_existing=True)
    submission_stream = subreddit.stream.submissions(pause_after=-1, skip_existing=True)
    
    def process_and_emit(thread):
        # skip if None or thread should be filtered
        if thread is None:
            return True
        if should_filter(thread):
            return True

        thread_info = get_thread_info(thread)
        
        print(thread.id)

        thread_sentiment = TextBlob(thread_info['body']).sentiment.polarity
        thread_info['sentiment'] = thread_sentiment
        current_time_str = get_current_time()

        
        for ticker in thread_info['tickers']:
            documents_that_contain_ticker = mongo.db.tickers.find_one(
                { 'time': { '$eq': current_time_str} }
            )

            current_mentions = 0
            current_sentiment = 0
            positive_count = 0
            neutral_count = 0
            negative_count = 0
            # if didn't find document with the timeframe
            if (documents_that_contain_ticker is None):
                pass
            # if found the timeframe but didn't find the ticker
            elif (ticker not in documents_that_contain_ticker['tickers']):
                pass
            # else if found
            else:
                current_mentions =  documents_that_contain_ticker['tickers'][ticker]['mentions']
                current_sentiment =  documents_that_contain_ticker['tickers'][ticker]['sentiment']
                positive_count = documents_that_contain_ticker['tickers'][ticker]['positive_count']
                neutral_count = documents_that_contain_ticker['tickers'][ticker]['neutral_count']
                negative_count = documents_that_contain_ticker['tickers'][ticker]['negative_count']

            def calculate_new_sentiment():
                if current_mentions == 0:
                    return thread_sentiment
                sentiment_sum = current_sentiment * current_mentions
                new_sentiment = (sentiment_sum + thread_sentiment)/new_mentions
                return new_sentiment

            new_mentions = current_mentions + 1
            new_sentiment = calculate_new_sentiment()
            if thread_sentiment > 0:
                positive_count += 1
            elif thread_sentiment < 0:
                negative_count += 1
            elif thread_sentiment == 0:
                neutral_count += 1

            ticker_info = {
                'name': ticker,
                'mentions': new_mentions,
                'sentiment': new_sentiment,
                'positive_count': positive_count,
                'neutral_count': neutral_count,
                'negative_count': negative_count
            }

            # update info in db
            mongo.db.tickers.update(
                { "time": current_time_str }, 
                {
                    '$set': {
                        f'tickers.{ticker}': ticker_info
                    }
                }
            , upsert=True)

        # emit to client
        socketio.emit('new thread', thread_info)
        mongo.db.last_thread.replace_one({}, thread_info, upsert=True)

    # run listener for new threads, if True is returned, skip
    while True:
        try:
            for thread in comment_stream:
                if process_and_emit(thread):
                    break
            for thread in submission_stream:
                if process_and_emit(thread):
                    break
        except Exception as e:
            elog.write(f'{e}\n')

# def main():
threading.Thread(target=reddit_thread).start()
threading.Thread(target=flask_thread).start()

# if __name__ == '__main__':
    # main()