import string
from datetime import datetime
import requests
import os
from dotenv import load_dotenv

from tickers import *

import yfinance as yf
import praw

from textblob import TextBlob

from flask import Flask, Response, request
from flask_cors import CORS
from flask_pymongo import PyMongo
from flask_socketio import SocketIO, send, emit

#dev
import json

load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'secret!'
mongo_URI = os.environ.get("mongo_URI")
print(mongo_URI)
app.config["MONGO_URI"] =  mongo_URI
mongo = PyMongo(app)
socketio = SocketIO(app, cors_allowed_origins="*")

reddit = praw.Reddit(
     client_id=os.environ.get("client_id"),
     client_secret=os.environ.get("client_secret"),
     user_agent=os.environ.get("user_agent")
 )

def is_more_than_hour_old(time_string):
    now = datetime.now()
    difference = now - datetime.strptime(time_string, "%Y-%m-%d %H:%M:%S")
    return True if difference.seconds > 3600 else False
    
def get_tickers_from_sub(subreddit_name):
    # check if tickers collection exist in database
    # if db.getCollectionNames().indexOf("tickers") = -1:

    subreddit = mongo.db.subreddits.find_one({
        'subreddit': subreddit_name
    })

    if subreddit is None or is_more_than_hour_old(subreddit['last_updated']):
        sub = reddit.subreddit(subreddit_name)
        posts = list(sub.hot(limit=10))

        subreddit = {
            "subreddit": subreddit_name,
            "tickers": {}
        }

        for post in posts:
            print(f'getting tickers from {post.title}')
            comments = list(post.comments)
            for comment in comments:
                if hasattr(comment, 'body'):
                    comment = comment.body
                    words = comment.split()
                    new_words = []

                    sentiment = TextBlob(comment).sentiment.polarity

                    # strip punctuation in word list
                    # and capitalize them so each word is not case sensitive
                    for i, word in enumerate(words):
                        word = word.strip(string.punctuation)
                        word = word.upper()
                        if word in blacklisted_symbols:
                            continue
                        if not word.isalpha():
                            continue
                        if len(word) > 6:
                            continue
                        if word not in ticker_list:
                            continue
                        new_words.append(word)

                    # print(new_words)

                    # count words
                    for word in new_words:
                        current_count = subreddit["tickers"].get(word, {}).get('count', 0)
                        new_count = current_count+1

                        if word not in subreddit["tickers"]:
                            subreddit["tickers"][word] = {}

                        subreddit["tickers"][word]['count'] = new_count

                        # calculate new sentiment if the sentiment is not neutral
                        if sentiment > 0:
                            current_positive_sentiment = subreddit["tickers"][word].get('pos_sent', 0)
                            positive_sentiment_count = subreddit["tickers"][word].get('pos_sent_cnt', 0)
                            new_sentiment_count = positive_sentiment_count + 1

                            subreddit["tickers"][word]['pos_sent'] = (current_positive_sentiment * positive_sentiment_count + sentiment)/(positive_sentiment_count+1)
                            subreddit["tickers"][word]['pos_sent_cnt'] = new_sentiment_count

                        elif sentiment < 0:
                            current_negative_sentiment = subreddit["tickers"][word].get('neg_sent', 0)
                            negative_sentiment_count = subreddit["tickers"][word].get('neg_sent_cnt', 0)
                            new_sentiment_count = negative_sentiment_count + 1

                            subreddit["tickers"][word]['neg_sent'] = (current_negative_sentiment * negative_sentiment_count + sentiment)/new_sentiment_count
                            subreddit["tickers"][word]['neg_sent_cnt'] = new_sentiment_count

                        else:
                            subreddit["tickers"][word]['neut_sent_cnt'] = subreddit["tickers"][word].get('neut_sent_cnt', 0) + 1


        # mongo can't store a document that's too big
        # so trimming down the ticker list
        # anything less than 5 mentions is negligible
        for ticker in list(subreddit['tickers'].keys()):
            if subreddit['tickers'][ticker]['count'] < 2:
                subreddit['tickers'].pop(ticker)

        subreddit['last_updated'] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        mongo.db.subreddits.delete_one({'subreddit': subreddit_name})
        mongo.db.subreddits.insert_one(subreddit)

    return Response(json.dumps(subreddit, default=str), mimetype="application/json")


# print(f'There are {stickied.num_comments} comments, querying all will approximately take {stickied.num_comments/20/60} minutes')
# print('Got all comments')

@app.route('/')
def home():
    return 'home :)'

@app.route('/<subreddit>')
def get_tickers(subreddit):
    return get_tickers_from_sub(subreddit)

@app.route('/blacklist_ticker', methods=['POST'])
def blacklist_ticker_route():
    try:
        data = request.get_json()
        secret = data.get('secret')
        if secret is None or secret != os.environ.get('blacklist_secret'):
            return "Adding blacklist failed.", 401
        ticker = data.get('ticker')
        add_to_blacklist(ticker)
        mongo.db.subreddits.update_many({}, { "$unset" : { f"tickers.{ticker}": 1} })
        return "Success", 200
    except:
        return "Error", 500

@socketio.on('connect')
def connected():
    emit('connection response', {
        'data': 'yoo'
    })

if __name__ == '__main__':
    socketio.run(app)
