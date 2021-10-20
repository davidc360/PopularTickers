import os
import json
import threading
from helpers import get_current_time

from dotenv import load_dotenv
load_dotenv()

from flask import Flask, Response, request
from flask_cors import CORS
from flask_pymongo import PyMongo
from flask_socketio import SocketIO, send, emit

import praw
from tickers import ticker_list, extract_tickers
from reddit import reddit, subreddits_to_monitor, get_thread_info, should_filter
from textblob import TextBlob

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.environ.get("mongo_URI")
mongo_URI = os.environ.get("mongo_URI")
app.config["MONGO_URI"] =  mongo_URI
mongo = PyMongo(app)
socketio = SocketIO(app, cors_allowed_origins="*")

SSL_fullchain_path = os.environ.get("SSL_fullchain_path")
SSL_privatekey_path = os.environ.get("SSL_privatekey_path")
SSL_context = None if SSL_fullchain_path is None or SSL_privatekey_path is None else (SSL_fullchain_path, SSL_privatekey_path)

@app.route('/tickerlist')
def tickerlist():
    return json.dumps(list(ticker_list))

@app.route('/stats')
def returnStats():
    current_time_str = get_current_time()
    document = mongo.db.tickers.find_one(
        { current_time_str: {'$exists': 1} },
        { f'{current_time_str}': 1}
    )
    if document is None:
        return json.dumps(None)

    return json.dumps(document[current_time_str], default=str)

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
        current_time_str = get_current_time()

        tickers_with_info = []
        
        for ticker in thread_info['tickers']:
            documents_that_contain_ticker = mongo.db.tickers.find_one(
                { current_time_str: {'$exists': 1 } }, 
                { f'{current_time_str}.{ticker}': 1 }
            )

            current_mentions = 0
            current_sentiment = 0
            positive_count = 0
            neutral_count = 0
            negative_count = 0
            # if didn't find document with the timeframe
            if (documents_that_contain_ticker is None or current_time_str not in documents_that_contain_ticker):
                pass
            # if found the timeframe but didn't find the ticker
            elif (ticker not in documents_that_contain_ticker[current_time_str]):
                pass
            # else if found
            else:
                current_mentions =  documents_that_contain_ticker[current_time_str][ticker]['mentions']
                current_sentiment =  documents_that_contain_ticker[current_time_str][ticker]['sentiment']
                positive_count = documents_that_contain_ticker[current_time_str][ticker]['positive_count']
                neutral_count = documents_that_contain_ticker[current_time_str][ticker]['neutral_count']
                negative_count = documents_that_contain_ticker[current_time_str][ticker]['negative_count']

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
            mongo.db.tickers.update({}, {
                    '$set': {
                        f'{current_time_str}.{ticker}': ticker_info
                    }
            }, upsert=True)

            tickers_with_info.append(ticker_info)

        # emit to client
        thread_info['tickers'] = tickers_with_info
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
        except praw.exceptions.APIException as e:
            print(e)

# def main():
threading.Thread(target=reddit_thread).start()
threading.Thread(target=flask_thread).start()

# if __name__ == '__main__':
    # main()