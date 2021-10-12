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

def get_thread_info(thread):
    # name of thread starting with t1_ = comment
    # t3_ = submission
    # https://www.reddit.com/dev/api/#fullnames

    type = None
    if thread.name[0:2] == 't1':
        type = 'comment'
    elif thread.name[0:2] == 't3':
        type = 'post'
    return {
        'title': thread.title if type == 'post' else None,
        'body': thread.selftext if type == 'post' else thread.body,
        'author': thread.author.name,
        'subreddit': thread.subreddit.display_name,
        'link': thread.permalink
    }