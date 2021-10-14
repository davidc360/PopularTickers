import os
import json
import threading
import datetime as d

from dotenv import load_dotenv

from flask import Flask, Response, request
from flask_cors import CORS
from flask_pymongo import PyMongo
from flask_socketio import SocketIO, send, emit

from tickers import ticker_list, extract_tickers
from reddit import reddit, subreddits_to_monitor, get_thread_info, should_filter

load_dotenv()


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

def flask_thread():
    socketio.run(app)

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
        socketio.emit('new thread', thread_info)

        current_time_str = d.datetime.now().strftime("%Y%m%d%H")
        for ticker in thread_info['tickers']:        
            mongo.db.tickers.update({current_time_str: {'$exists': 1}}, {
                    '$inc': {f'{current_time_str}.{ticker}': 1}
            }, upsert=True)

    while True:
        for thread in comment_stream:
            if process_and_emit(thread):
                break
        for thread in submission_stream:
            if process_and_emit(thread):
                break

if __name__ == '__main__':
    threading.Thread(target=flask_thread).start()
    threading.Thread(target=reddit_thread).start()