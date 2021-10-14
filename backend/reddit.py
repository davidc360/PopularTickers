import os
import praw
from tickers import extract_tickers

subreddits_to_monitor = [
    'wallstreetbets',
    'wallstreetbetsogs',
    'stocks',
    'pennystocks',
    'spacs',
    'investing',
    'options',
    'robinhood',
]

authors_to_filter = [
    'VisualMod',
    'AutoModerator'
]

reddit = praw.Reddit(
     client_id=os.environ.get("client_id"),
     client_secret=os.environ.get("client_secret"),
     user_agent=os.environ.get("user_agent")
)

def get_thread_type(thread):
    type = None
    if thread.name[0:2] == 't1':
        type = 'comment'
    elif thread.name[0:2] == 't3':
        if thread.is_self:
            type = 'textpost'
        else:
            type = 'linkpost'
    return type

def get_thread_info(thread):
    # name of thread starting with t1_ = comment
    # t3_ = submission
    # https://www.reddit.com/dev/api/#fullnames
    type = get_thread_type(thread)

    body = None
    if type == 'comment':
        body = thread.body_html
    elif type == 'textpost':
        body = thread.selftext
    elif type == 'linkpost':
        body = thread.url 
    
    tickers = extract_tickers(body)
    
    return {
        'title': thread.title if 'post' in type else None,
        'body': body,
        'author': thread.author.name,
        'subreddit': thread.subreddit.display_name,
        'link': thread.permalink,
        'tickers': tickers,
        'type': type
    }

def should_filter(thread):
    author = thread.author.name
    if author in authors_to_filter:
        return True
    elif hasattr(thread, 'removed_by_category') and thread.removed_by_category is not None:
        return True
    else:
        return thread.stickied