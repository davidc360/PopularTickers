import os
import threading
from dotenv import load_dotenv

from flask import Flask, Response, request
from flask_cors import CORS
from flask_pymongo import PyMongo
from flask_socketio import SocketIO, send, emit

from tickers import *
from reddit import reddit

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
    subreddit = reddit.subreddit('wallstreetbets')
    comment_stream = subreddit.stream.comments(pause_after=-1, skip_existing=True)
    submission_stream = subreddit.stream.submissions(pause_after=-1, skip_existing=True)
    while True:
        for comment in comment_stream:
            if comment is None:
                break
            # print(comment.body)
            print('comment')
            socketio.emit('comment', {
                'body': comment.body,
                'author': comment.author.name
            })
        for submission in submission_stream:
            if submission is None:
                break
            # print(submission.title)
            print('post')
            socketio.emit('post', {
                'title': submission.title,
                'body': submission.selftext,
                'author': submission.author.name
            })

if __name__ == '__main__':
    threading.Thread(target=flask_thread).start()
    threading.Thread(target=reddit_thread).start()