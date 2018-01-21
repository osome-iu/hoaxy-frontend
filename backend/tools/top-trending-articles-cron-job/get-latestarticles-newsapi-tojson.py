#!/usr/bin/env python

#Author: Mihai Avram, e-mail: mihai.v.avram@gmail.com

#IMPORTANT: We use the News API here. Please make sure that proper https://newsapi.org/privacy policy is used.  For instance, the News API attribution link must be used and keys cannot be shared and must abide to certain limits.  More information can be found here: https://newsapi.org/

# used for logging errors
import sys
import traceback

# used for writing json files
import json

# used for making http requests
import requests

#for printing errors
def print_error(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)
def print_exception_stacktrace():
    exc_type, exc_value, exc_traceback = sys.exc_info()
    traceback.print_exception(exc_type, exc_value, exc_traceback, limit=3, file=sys.stderr)

keys_and_passwords = json.load(open('keys-and-passwords.json'))

# News API endpoint that retrieves top articles from the US
url = 'https://newsapi.org/v2/top-headlines?country=us&apiKey=' + keys_and_passwords['NewsAPIKey']

# Making the get-news request
try:
    news_request = requests.get(url)
    news_json = news_request.json()
except:
    print_error("\nERROR occurred while attempting to retrieve the articles from the News API via GET request:", sys.exc_info()[0])
    print_exception_stacktrace()
    
# Parsing the returned request
try:
    articles = news_json['articles']
except:
    print_error("\nERROR occurred while attempting to retrieve the articles from the News API returned object:", sys.exc_info()[0])
    print_exception_stacktrace()
    
# Creating json data with latest news
latest_news = {}
try:
    for ix, article in enumerate(articles):
        headline = article['title']
        source = article['source']['name']
        url = article['url']
        article_data = {'headline': headline, 'source': source, 'url': url}
        latest_news[ix] = article_data
except:
    print_error("\nERROR occurred while attempting to retrieve the headline, source, and url from the articles and create a json file from the information.", sys.exc_info()[0])
    print_exception_stacktrace()  

# Writing results to a json file to be read/parsed later (note, we overwrite here)
try:
    with open('./top-news-results/top-news-usa.json', 'w') as news_file:
        json.dump(latest_news, news_file)
except:
    print_error("\nERROR occurred while attempting to write the latest news to the csv.", sys.exc_info()[0])
    print_exception_stacktrace()
        
