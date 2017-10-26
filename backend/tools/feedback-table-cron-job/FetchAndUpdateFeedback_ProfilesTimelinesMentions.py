#!/usr/bin/env python

#Author: Mihai Avram, e-mail: mihai.v.avram@gmail.com

#ALL IMPORTS
#for connecting to the database
import psycopg2
#for parsing json objects
import json
#for error logging
import sys, traceback
#Importing Twitter library essentials
from twitter import Twitter, OAuth, TwitterHTTPError, TwitterStream

#for obtaining keys and passwords needed to execute the code using various tools and libraries
keysandsecrets_json = json.load(open('iuni-twitterapi-keys-and-secrets.json'))

#can be used for debugging if exceptions start to occur
def print_exception():
    exc_type, exc_value, exc_traceback = sys.exc_info()
    traceback.print_exception(exc_type, exc_value, exc_traceback, limit=3, file=sys.stdout)

#ALL FUNCTIONS
#retrieve feedback target_user_id of all entries which have target_profile as null
def get_null_targetprofiles():
    #first we start with top 10 to not overload the Twitter API
    botometer_cursor.execute("SELECT target_user_id FROM feedback WHERE target_profile IS NULL LIMIT 10;")
    null_profiles = botometer_cursor.fetchall()
    return(null_profiles)

#retrieve feedback target_user_id of all entries which have target_timeline_tweets as null
def get_null_targettimelinetweets():
    #first we start with top 10 to not overload the Twitter API
    botometer_cursor.execute("SELECT target_user_id FROM feedback WHERE target_timeline_tweets IS NULL LIMIT 10;")
    null_profiles = botometer_cursor.fetchall()
    return(null_profiles)

#retrieve feedback target_user_id of all entries which have target_mention_tweets as null
def get_null_targetmentiontweets():
    #first we start with top 10 to not overload the Twitter API
    botometer_cursor.execute("SELECT target_user_id FROM feedback WHERE target_mention_tweets IS NULL LIMIT 10;")
    null_profiles = botometer_cursor.fetchall()
    return(null_profiles)

def populate_target_profiles_timelinetweets_mentiontweets(field_scope, populated_targets):        
    if field_scope == "target_profile":
        for target_user_id, profile in populated_targets.items():
            botometer_cursor.execute("""UPDATE public.feedback SET target_profile = %s WHERE target_user_id = %s;""",\
                                   (json.dumps(profile), target_user_id))
    
    elif field_scope == "target_timeline_tweets":
        for target_user_id, profile in populated_targets.items():
            botometer_cursor.execute("""UPDATE public.feedback SET target_timeline_tweets = %s WHERE target_user_id = %s;""",\
                                   (json.dumps(profile), target_user_id))

    
    elif field_scope == "target_mention_tweets":
        for target_user_id, profile in populated_targets.items():
            botometer_cursor.execute("""UPDATE public.feedback SET target_mention_tweets = %s WHERE target_user_id = %s;""",\
                                   (json.dumps(profile), target_user_id))

        #commiting changes
        pgsqlconn.commit()

#MAIN CODE
if __name__ == '__main__':
    #Error Log File
    error_log_file = open("feedback-get-profile-timeline-mention.err", "a")
    
    #Twitter API tokens
    ACCESS_TOKEN = keysandsecrets_json['IUNI_TWITTERAPI_ACCESS_TOKEN']
    ACCESS_SECRET = keysandsecrets_json['IUNI_TWITTERAPI_ACCESS_SECRET']
    CONSUMER_KEY = keysandsecrets_json['IUNI_TWITTERAPI_CONSUMER_KEY']
    CONSUMER_SECRET = keysandsecrets_json['IUNI_TWITTERAPI_CONSUMER_SECRET']

    #Accessing Twitter API using the tokens
    oauth = OAuth(ACCESS_TOKEN, ACCESS_SECRET, CONSUMER_KEY, CONSUMER_SECRET)

    #Twitter Search API Instance
    twitter = Twitter(auth=oauth)

    #Database connection
    DB_HOST_NAME = keysandsecrets_json['DB_HOST_NAME']
    DB_USER = keysandsecrets_json['DB_USER']
    DB_PASSWORD = keysandsecrets_json['DB_PASSWORD']
    DB_NAME = keysandsecrets_json['DB_NAME']
    DB_PORT = keysandsecrets_json['DB_PORT']
       
    #connecting to the database
    pgsqlconn = psycopg2.connect(host=DB_HOST_NAME, user=DB_USER, password=DB_PASSWORD, dbname=DB_NAME, port=DB_PORT)
    #cursor needed to execute db operations
    botometer_cursor = pgsqlconn.cursor()
    
    #POPULATING NULL PROFILES
    populated_target_userids_and_profiles = {}
    null_profiles = get_null_targetprofiles()
    
    #for loop on result above and retrieve null_profiles from Twitter API
    for user_id in null_profiles:
        try:
            #User Profile query (rate-limit = 300requests/15min)
            populated_target_userids_and_profiles[user_id[0]] = twitter.users.lookup(user_id=user_id[0])
            #Checking if the list is empty
            if not populated_target_userids_and_profiles[user_id[0]]:
                no_profile_found_dict = {}
                no_profile_found_dict['no-profile-found'] = 'No profile was available at the time when this user was reported'
                populated_target_userids_and_profiles[user_id[0]] = no_profile_found_dict
        except:
            error_log_file.write("USER PROFILE COULD NOT BE RETRIEVED, " + "UserId=" + str(user_id[0]) + ", Error=" + str(sys.exc_info()[0]) + "\n")
            no_profile_found_dict = {}
            no_profile_found_dict['no-profile-found'] = 'No profile was available at the time when this user was reported'
            populated_target_userids_and_profiles[user_id[0]] = no_profile_found_dict
            continue
            
    #populate null_profiles
    populate_target_profiles_timelinetweets_mentiontweets("target_profile", populated_target_userids_and_profiles)
    
    #POPULATING NULL TARGET TIMELINE TWEETS
    populated_target_userids_and_targettimelinetweets = {}
    null_targettimelinetweets = get_null_targettimelinetweets()
    
    #for loop on result above and retrieve target_timeline_tweets from Twitter API
    for user_id in null_targettimelinetweets:
        try:
            #Timeline Tweets query (rate-limit = 1500requests/15min)
            populated_target_userids_and_targettimelinetweets[user_id[0]] = twitter.statuses.user_timeline(user_id=user_id[0], count=200)
            #Checking if the list is empty
            if not populated_target_userids_and_targettimelinetweets[user_id[0]]:
                no_timeline_tweets_found_dict = {}
                no_timeline_tweets_found_dict['no-timeline-tweets-found'] = 'There were no timeline tweets available at the time when this user was reported'
                populated_target_userids_and_targettimelinetweets[user_id[0]] = no_timeline_tweets_found_dict
        except:
            error_log_file.write("USER TWEET TIMELINE COULD NOT BE RETRIEVED, " + "UserId=" + str(user_id[0]) + ", Error=" + str(sys.exc_info()[0]) + "\n")
            no_timeline_tweets_found_dict = {}
            no_timeline_tweets_found_dict['no-timeline-tweets-found'] = 'There were no timeline tweets available at the time when this user was reported'
            populated_target_userids_and_targettimelinetweets[user_id[0]] = no_timeline_tweets_found_dict
            continue
            
    #populate timeline_tweets
    populate_target_profiles_timelinetweets_mentiontweets("target_timeline_tweets", populated_target_userids_and_targettimelinetweets)
        
    #POPULATING NULL TARGET MENTION TWEETS
    populated_target_userids_and_targetmentiontweets = {}
    null_targetmentiontweets = get_null_targetmentiontweets()
    
    #for loop on result above and retrieve target_mention_tweets from Twitter API
    for user_id in null_targetmentiontweets:
        try:
            #Mention Tweets query (rate-limit = 75requests/15min)
            populated_target_userids_and_targetmentiontweets[user_id[0]] = twitter.statuses.mentions_timeline(user_id=user_id[0], count=200)
            #Checking if list is empty
            if not populated_target_userids_and_targetmentiontweets[user_id[0]]:
                no_mention_tweets_found_dict = {}
                no_mention_tweets_found_dict['no-mention-tweets-found'] = 'There were no mention tweets available at the time when this user was reported'
                populated_target_userids_and_targetmentiontweets[user_id[0]] = no_mention_tweets_found_dict
        except:
            error_log_file.write("USER MENTION TIMELINE NOT BE RETRIEVED, " + "UserId=" + str(user_id[0]) + ", Error=" + str(sys.exc_info()[0]) + "\n")
            no_mention_tweets_found_dict = {}
            no_mention_tweets_found_dict['no-mention-tweets-found'] = 'There were no mention tweets available at the time when this user was reported'
            populated_target_userids_and_targetmentiontweets[user_id[0]] = no_mention_tweets_found_dict
            continue

    #populate mention_tweets
    populate_target_profiles_timelinetweets_mentiontweets("target_mention_tweets", populated_target_userids_and_targetmentiontweets)
  
    #closing error log file
    error_log_file.close()
    
    #closing access to database
    botometer_cursor.close()
    pgsqlconn.close()
