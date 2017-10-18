#!/usr/bin/env python

#Author: Mihai Avram, e-mail: mihai.v.avram@gmail.com

#TODO BEFORE RUNNING: Change database configuration settings in pgsqlconn

#ALL IMPORTS
#for connecting to the database
import psycopg2
#for parsing json objects
import json
#for error logging
import sys, traceback

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
    #connecting to the database
    pgsqlconn = psycopg2.connect(host='', user='', password='', dbname='', port='')
    #cursor needed to execute db operations
    botometer_cursor = pgsqlconn.cursor()
    
    #POPULATING NULL PROFILES
    populated_target_userids_and_profiles = {}
    null_profiles = get_null_targetprofiles()
    
    #for loop on result above and retrieve null_profiles from Twitter API
    for user_id in null_profiles:
        populated_target_userids_and_profiles[user_id[0]] = "profile filler test"
    
    #populate null_profiles
    populate_target_profiles_timelinetweets_mentiontweets("target_profile", populated_target_userids_and_profiles)
    
    #POPULATING NULL TARGET TIMELINE TWEETS
    populated_target_userids_and_targettimelinetweets = {}
    null_targettimelinetweets = get_null_targettimelinetweets()
    
    #for loop on result above and retrieve target_timeline_tweets from Twitter API
    for user_id in null_targettimelinetweets:
        populated_target_userids_and_targettimelinetweets[user_id[0]] = "timeline tweets filler text"
    
    #populate timeline_tweets
    populate_target_profiles_timelinetweets_mentiontweets("target_timeline_tweets", populated_target_userids_and_targettimelinetweets)
        
    #POPULATING NULL TARGET MENTION TWEETS
    populated_target_userids_and_targetmentiontweets = {}
    null_targetmentiontweets = get_null_targetmentiontweets()
    
    #for loop on result above and retrieve target_mention_tweets from Twitter API
    for user_id in null_targetmentiontweets:
        populated_target_userids_and_targetmentiontweets[user_id[0]] = "mention tweets filler text"
      
    #populate mention_tweets
    populate_target_profiles_timelinetweets_mentiontweets("target_mention_tweets", populated_target_userids_and_targetmentiontweets)
  
    #closing access to database
    botometer_cursor.close()
    pgsqlconn.close()
