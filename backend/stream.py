import os
import threading
from dotenv import load_dotenv

from flask import Flask, Response, request
from flask_cors import CORS
from flask_pymongo import PyMongo
from flask_socketio import SocketIO, send, emit

from tickers import *
from reddit import reddit, subreddits_to_monitor, get_thread_info, should_filter

load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.environ.get("mongo_URI")
mongo_URI = os.environ.get("mongo_URI")
app.config["MONGO_URI"] =  mongo_URI
mongo = PyMongo(app)
socketio = SocketIO(app, cors_allowed_origins="*")

@socketio.on('connect')
def connected():
    emit('message', {
        'message': 'hahaha'
    })

def flask_thread():
    socketio.run(app)

def reddit_thread():
    subreddit = reddit.subreddit('+'.join(subreddits_to_monitor))
    comment_stream = subreddit.stream.comments(pause_after=-1, skip_existing=True)
    submission_stream = subreddit.stream.submissions(pause_after=-1, skip_existing=True)
    while True:
        for comment in comment_stream:
            if comment is None:
                break
            if should_filter(comment):
                break
            socketio.emit('comment', get_thread_info(comment))
        for submission in submission_stream:
            if submission is None:
                break
            if should_filter(submission):
                break
            # print(submission.title)
            # socketio.emit('post', {
            #     'title': submission.title,
            #     'body': submission.selftext,
            #     'author': submission.author.name,
            #     'subreddit': submission.subreddit.display_name
            # })
            socketio.emit('post', get_thread_info(submission))

if __name__ == '__main__':
    threading.Thread(target=flask_thread).start()
    threading.Thread(target=reddit_thread).start()