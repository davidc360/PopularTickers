import requests
import string
import re
from datetime import datetime

blacklisted_symbols = set()

def refresh_blacklist_list():
    blacklists = ['blacklisted_tickers.txt', 'html_tags_list.txt']
    for list in blacklists:
        with open(list, 'r') as f:
            for line in f:
                blacklisted_symbols.add(line.strip().upper())

def add_to_blacklist(ticker):
    with open('blacklisted_tickers.txt', 'a') as f:
        if ticker not in blacklisted_symbols:
            f.write(f"\n{ticker}")
        f.close()
        refresh_blacklist_list()

refresh_blacklist_list()

def get_blacklist():
    return blacklisted_symbols

def get_ticker_list():
    ticker_list_plain_text = ""
    ticker_list = set()

    NASDAQ_LIST_LINK = "http://ftp.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt"
    OTHER_LIST_LINK = "http://ftp.nasdaqtrader.com/dynamic/SymDir/otherlisted.txt"

    # get list from NASDAQ api, skip first and last line
    # if NASDAQ api fails, use backup file
    try:
        NASDAQ_REQ = requests.get(NASDAQ_LIST_LINK, timeout=10)
        OTHER_REQ = requests.get(OTHER_LIST_LINK, timeout=10)
        ticker_list_plain_text = NASDAQ_REQ.text.splitlines()[1:-1] + OTHER_REQ.text.splitlines()[1:-1]
    except requests.exceptions.RequestException:
        print("NASDAQ did not return ticker lists, using backup list")
        return set(open("all_tickers_2021_10-26.txt", "r").read().splitlines())

    for line in ticker_list_plain_text:
        # read until "|"
        ticker = line.split("|")[0]
        if ticker not in blacklisted_symbols:
            ticker_list.add(ticker)

    return ticker_list

ticker_list = get_ticker_list()
# write the ticker_list to file
ticker_backup_file = open(f'all_tickers_{datetime.now().strftime("%Y_%m-%d")}.txt.temp', 'w+')
for ticker in ticker_list:
    ticker_backup_file.write(f"{ticker}\n")

uppercase_tickers = set(open("uppercase_only_tickers.txt", "r").read().splitlines())

def extract_tickers(text):
    # words = text.split()
    words = re.split('([?<> .,-])', text)
    new_words = []

    # filter words:
    for word in words:
        # strip punctuation
        word = word.strip(string.punctuation)
        # capitalize if word is not in the uppercase only list
        if word.upper() not in uppercase_tickers:
            word = word.upper()
        # not blacklisted
        if word in blacklisted_symbols:
            continue
        # alphabets only
        if not word.isalpha():
            continue
        # 6 letters and under
        if len(word) > 6:
            continue
        # word is a ticker
        if word not in ticker_list:
            continue
        new_words.append(word)

    return new_words