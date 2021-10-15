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

@app.route('/tickerlist')
def tickerlist():
    return json.dumps(list(ticker_list))

@app.route('/stats')
def returnStats():
    current_time_str = get_current_time()
    ticker = mongo.db.tickers.find_one({ current_time_str: {'$exists': 1} })
    return json.dumps(ticker[current_time_str] if ticker is not None else None, default=str)

@app.route('/last_thread')
def returnLastThread():
    last_thread = mongo.db.last_thread.find_one({})
    return json.dumps(last_thread, default=str)

def flask_thread():
    socketio.run(app, host='0.0.0.0')

def reddit_thread():
    subreddit = reddit.subreddit('+'.join(subreddits_to_monitor))
    comment_stream = subreddit.stream.comments(pause_after=-1, skip_existing=True)
    submission_stream = subreddit.stream.submissions(pause_after=-1, skip_existing=True)
    
    def process_and_emit(thread):
        if thread is None:
            return True
        if should_filter(thread):
            return True

        thread_info = get_thread_info(thread)
        print(thread_info)
        thread_info['sentiment'] = TextBlob(thread_info['body']).sentiment.polarity
        socketio.emit('new thread', thread_info)
        mongo.db.last_thread.replace_one({}, thread_info, upsert=True)

        current_time_str = get_current_time()
        for ticker in thread_info['tickers']:        
            mongo.db.tickers.update_one({current_time_str: {'$exists': 1}}, {
                    '$inc': {f'{current_time_str}.{ticker}': 1}
            }, upsert=True)

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