import os
import praw

subreddits_to_monitor = [
    'wallstreetbets',
    'stocks',
    'pennystocks',
    'spacs',
    'investing',
    'options',
    'robinhood',
]

reddit = praw.Reddit(
     client_id=os.environ.get("client_id"),
     client_secret=os.environ.get("client_secret"),
     user_agent=os.environ.get("user_agent")
)