import requests

blacklisted_symbols = set()

def refresh_blacklist_list():
    with open('blacklisted_tickers.txt', 'r') as f:
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

# def get_ticker_list():
#     ticker_list = set()
#     url = 'https://dumbstockapi.com/stock?exchanges=NYSE,NASDAQ,AMEX'
#     for stock in requests.get(url).json():
#         ticker = stock['ticker']
#         if ticker not in blacklisted_symbols:
#             ticker_list.add(ticker)

#     return ticker_list

def get_ticker_list():
    ticker_list_plain_text = ""
    ticker_list = set()

    NASDAQ_LIST_LINK = "http://ftp.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt"
    OTHER_LIST_LINK = "http://ftp.nasdaqtrader.com/dynamic/SymDir/otherlisted.txt"
    # get list from NASDAQ api, skip first and last line
    NASDAQ_REQ = requests.get(NASDAQ_LIST_LINK)
    OTHER_REQ = requests.get(OTHER_LIST_LINK)
    if NASDAQ_REQ.status_code != 200 or OTHER_REQ.status_code != 200:
        print("NASDAQ did not return ticker lists, using backup list")
        ticker_list_plain_text = open("all_tickers_aug_28_21.txt", "r").read().splitlines()
    else:
        ticker_list_plain_text = NASDAQ_REQ.text.splitlines()[1:-1] + OTHER_REQ.text.splitlines()[1:-1]

    for line in ticker_list_plain_text:
        # read until "|"
        ticker = line.split("|")[0]
        if ticker not in blacklisted_symbols:
            ticker_list.add(ticker)

    return ticker_list

ticker_list = get_ticker_list()