#!/usr/bin/evn python

#Author: Mihai Avram, e-mail: mihai.v.avram@gmail.com

#ALL IMPORTS
#for parsing the data in the logs
import json
#for connecting to the database
import psycopg2
#for error logging
import sys
#for timing purposes
import time

#ALL FUNCTIONS
#function for deciding on a score value to use for bot_score_english and bot_score_universal depending on what's available in the log
def score_decider(potential_score_keys, line_json):
    for key in potential_score_keys:
        if len(key) == 1:
            key1 = key[0]
            try:
                score = line_json[key1]
                return score
            except:
                continue
        elif len(key) == 2:
            key1 = key[0]
            key2 = key[1]
            try:
                score = line_json[key1][key2]
                return score
            except:
                continue
    
    return None

#lookps up previous num_requests value
def num_requests_lookup(user_id):
    botbase_cursor.execute("""SELECT num_requests FROM public.botscore WHERE user_id=%s ORDER BY time_stamp DESC LIMIT 1;""", (user_id,))
    return botbase_cursor.fetchone()

#inserts log to database
def log_insertion_script(user_id, screen_name, time_stamp, all_bot_scores, bot_score_english, \
                bot_score_universal, requester_ip, tweets_per_day, num_tweets, \
                num_mentions, latest_tweet_timestamp, num_requests, user_profile):
    
    botbase_cursor.execute("""INSERT INTO public.botscore(
                user_id, screen_name, time_stamp, all_bot_scores, bot_score_english, 
                bot_score_universal, requester_ip, tweets_per_day, num_tweets, 
                num_mentions, latest_tweet_timestamp, num_requests, user_profile) 
                              VALUES 
                (%s, %s, to_timestamp(%s), %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);""", \
                (user_id, screen_name, time_stamp, json.dumps(all_bot_scores), bot_score_english, \
                bot_score_universal, requester_ip, tweets_per_day, num_tweets, \
                num_mentions, latest_tweet_timestamp, num_requests, user_profile))

    #commiting changes
    pgsqlconn.commit()

#GLOBAL VARIABLES
total_number_of_lines_parsed = 0
records_committed = 0
errors_and_informational_count = 0
unmatched_botscore_category_schema_count = 0
json_not_proper_log_count = 0
json_with_no_type_count = 0
failed_to_retrieve_proper_fields_count = 0
failed_to_commit_to_db_count = 0

non_existing_user = 0
    
#MAIN CODE
if __name__ == '__main__':
    #connecting to the database
    pgsqlconn = psycopg2.connect(host='localhost', user='postgres', password='password', dbname='botbase')
    #cursor needed to execute db operations
    botbase_cursor = pgsqlconn.cursor()
    #starting timer
    timer_start = time.time()
    
    #log name and location information
    log_path = '/home/mavram/Research/HoaxyBotometer/ImportBackuplogsTask/logs/backups/unzipstage/'
    #log_path = '/home/mavram/Research/HoaxyBotometer/ImportBackuplogsTask/logs/recent/'
    log_file_list = ['test','botornot.log201702', 'botornot.log201705']
                    #'botornot.log201506',
                     #, 'botornot.log201510', 'botornot.log201605', 'botornot.log201701', \
                     #'botornot.log201702', 'botornot.log201705', 'botornot.log.2017-05-14', 'botornot.log.2017-05-21', \
                     #'botornot.log.2017-05-28', 'botornot.log.2017-06-04', 'botornot.log.2017-06-11', 'botornot.log.2017-06-18', \
                     #'botornot.log.2017-06-25', 'botornot.log.2017-07-02', 'botornot.log.2017-07-09', 'botornot.log.2017-07-16', \
                     #'botornot.log.2017-07-23', 'botornot.log.2017-07-30', 'botornot.log.2017-08-06', 'botornot.log.2017-08-13']
                    #recent
                    #botornot.log.2017-08-20  botornot.log.2017-08-27
    #log to store any errors due to the logs not containing the proper data (i.e. other logging information such as errors or other requests)
    error_log_file = open("botscoreloginsertion.err", "w")
  
    #iterating through all log files
    for log in log_file_list:
        print("Starting to import log: ", log)
        file_location = log_path + log

        #parsing logs and uploading the entries to the botometer database
        log_file = open(file_location,"r")

        for line_num, line in enumerate(log_file, start = 1):
            total_number_of_lines_parsed = total_number_of_lines_parsed + 1
            
            #checking if the current line is json, if not then this line should not be parsed because we are only looking for json log lines
            try: 
                line_json = json.loads(line)
            except:
                errors_and_informational_count = errors_and_informational_count + 1
                continue
            
            try:
                if not line_json["type"] == "log":
                    json_not_proper_log_count = json_not_proper_log_count + 1
                    continue
            except:
                json_with_no_type_count = json_with_no_type_count + 1
                error_log_file.write("NO-LOG-TYPE-JSON INFO---File: " + log + " LineNumber: " + str(line_num) + " Error: " + str(sys.exc_info()[0]) + "\n")
                continue
            
            #parsing json line and retrieving the proper fields regarding the user i.e. user id, screen name, tweets, etc...
            try:
                user_id = line_json["search"]["user_id"]
                screen_name = str(line_json["search"]["sn"])
                if len(screen_name) > 15:
                    #user may have a screen-name logged as longer than 15 characters which is not proper in Twitter and could be instead the userid or some other error so we make it none
                    screen_name = None
                time_stamp = line_json["timestamp"]
                #some timestamps are stored in milliseconds so for those we divide by 1000
                if len(str(time_stamp)) >= 12:
                    time_stamp = time_stamp/1000
                botscore_representation = line_json["categories"]
                
                #parsing the bot scores to match the schema from here https://market.mashape.com/OSoMe/botometer
                try:
                    friend_score = round(botscore_representation['friend_classification'], 2)
                    sentiment_score = round(botscore_representation['sentiment_classification'], 2)
                    temporal_score = round(botscore_representation['temporal_classification'], 2)
                    user_score = round(botscore_representation['user_classification'], 2)
                    network_score = round(botscore_representation['network_classification'], 2)
                    content_score = round(botscore_representation['content_classification'], 2)
                    all_bot_scores = {"friend": friend_score, "sentiment": sentiment_score, "temporal": temporal_score, "user": user_score, "network": network_score, "content": content_score}
                except:
                    #parsing another representation which is exactly as the mashape botscore api
                    try:
                        friend_score = round(botscore_representation['friend'], 2)
                        sentiment_score = round(botscore_representation['sentiment'], 2)
                        temporal_score = round(botscore_representation['temporal'], 2)
                        user_score = round(botscore_representation['user'], 2)
                        network_score = round(botscore_representation['network'], 2)
                        content_score = round(botscore_representation['content'], 2)
                        all_bot_scores = {"friend": friend_score, "sentiment": sentiment_score, "temporal": temporal_score, "user": user_score, "network": network_score, "content": content_score}
                    except:
                        #parsing a list schema instead of json schema i.e. [["network",0.5], ["sentiment",0.2], ...]
                        try:
                            friend_score = round(botscore_representation[5][1], 2)
                            sentiment_score = round(botscore_representation[1][1], 2)
                            temporal_score = round(botscore_representation[2][1], 2)
                            user_score = round(botscore_representation[4][1], 2)
                            network_score = round(botscore_representation[0][1], 2)
                            content_score = round(botscore_representation[3][1], 2)
                            all_bot_scores = {"friend": friend_score, "sentiment": sentiment_score, "temporal": temporal_score, "user": user_score, "network": network_score, "content": content_score}                            
                        except:
                             #score schema does not include the needed scores so will insert as null
                            unmatched_botscore_category_schema_count = unmatched_botscore_category_schema_count + 1
                            error_log_file.write("NON-MATCHED-CATEGORY-SCHEMA INFO---File: " + log + " LineNumber: " + str(line_num) + " Error: " + str(sys.exc_info()[0]) + "\n")
                            all_bot_scores = None
                #english bot score which is either found in line_json["score"], line_json["classification"], line_json["score"]["english"]
                keys = [["score","english"],["score"],["classification"]]
                bot_score_english = score_decider(keys, line_json)
                #universal bot score which is either found in line_json["score"]["universal"] or line_json["categories"]["languageagnostic_classification"] otherwise null
                keys = [["score","universal"],["categories","languageagnostic_classification"]]
                bot_score_universal = score_decider(keys, line_json)
                #storing a comma delimited string of ips
                requester_ip = line_json["remote_ip"]
                #some ips are stored in lists and some not, must distinguish and treat them separately here
                #in order to yield <ip1>,<ip2>,etc...
                if type(requester_ip) == list:
                    requester_ip = ','.join(line_json["remote_ip"])                
                tweets_per_day = None
                num_tweets = line_json["num_tweets"]
                num_mentions = None
                latest_tweet_timestamp = None
                num_requests = 1
                user_profile = None
                try:
                    #retrieving previous number of requests for user, so that we can increment it by one
                    num_requests = num_requests_lookup(int(user_id))[0]
                    num_requests = num_requests + 1
                except:
                    #user does not exist yet in the database
                    non_existing_user = non_existing_user + 1
            except:
                error_log_file.write("NON-PROPER-FIELDS ERROR---File: " + log + " LineNumber: " + str(line_num) + " Error: " + str(sys.exc_info()[0]) + "\n")
                failed_to_retrieve_proper_fields_count = failed_to_retrieve_proper_fields_count + 1
                continue
                
            try:
                #inserting data to the database
                log_insertion_script(user_id, screen_name, time_stamp, all_bot_scores, bot_score_english, bot_score_universal, \
                            str(requester_ip), tweets_per_day, num_tweets, num_mentions, latest_tweet_timestamp, num_requests, user_profile)
                records_committed = records_committed + 1
            except:
                error_log_file.write("DB INSERTION ERROR---File: " + log + " LineNumber: " + str(line_num) + " Error: " + str(sys.exc_info()[0]) + "\n")
                failed_to_commit_to_db_count = failed_to_commit_to_db_count + 1          
                continue

        print("Finished importing log: ", log)

    #closing access to database
    botbase_cursor.close()
    pgsqlconn.close()

    #closing log files
    log_file.close()
    error_log_file.close()

    #ending and evaluating time elapsed
    print("%s seconds elapsed" % (time.time()-timer_start))
    print("Log Import Process Completed!")
    
    #printing log statistics
    print("LOG IMPORT PROCESS INFORMATION:")
    print("total-lines-parsed: ", total_number_of_lines_parsed)
    print("records-committed: ", records_committed)
    print("non-json-lines: ",errors_and_informational_count)
    print("non-log-json-type: ", json_not_proper_log_count)
    print("json-with-no-type: ", json_with_no_type_count)
    print("non-matched-proper-score-category-schema: ", unmatched_botscore_category_schema_count)
    print("non-proper-fields-upon-retrieval: ", failed_to_retrieve_proper_fields_count)
    print("db-commit-failures: ", failed_to_commit_to_db_count)
