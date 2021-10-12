import os
import praw

reddit = praw.Reddit(
     client_id=os.environ.get("client_id"),
     client_secret=os.environ.get("client_secret"),
     user_agent=os.environ.get("user_agent")
)