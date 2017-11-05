#!/usr/bin/env python

#Author: Mihai Avram, e-mail: mihai.v.avram@gmail.com

#TODO BEFORE RUNNING: Change database configuration settings in pgsqlconn and also log_path, as well as the log_file_list with the files one wants to upload

#ALL IMPORTS
#for parsing the data in the logs
import json
#for connecting to the database
import psycopg2
#for error logging
import sys, traceback
#for timing purposes
import time

#can be used for debugging if exceptions start to occur
def print_exception():
    exc_type, exc_value, exc_traceback = sys.exc_info()
    traceback.print_exception(exc_type, exc_value, exc_traceback, limit=3, file=sys.stdout)

#ALL FUNCTIONS
    
#inserts feedback log to database
def feedback_insertion_script(source_user_id, target_user_id, target_screen_name, time_stamp, feedback_label, \
                              feedback_text, target_profile, target_timeline_tweets, target_mention_tweets, target_reported_botscores):
    try:
        botbase_cursor.execute("""INSERT INTO public.feedback(source_user_id, target_user_id, target_screen_name, time_stamp, feedback_label,
                            feedback_text, target_profile, target_timeline_tweets, target_mention_tweets, target_reported_botscores) 
                                  VALUES 
                    (%s, %s, %s, to_timestamp(%s), %s, %s, %s, %s, %s, %s);""", \
                    (source_user_id, target_user_id, target_screen_name, time_stamp, feedback_label, \
                    feedback_text, target_profile, target_timeline_tweets, target_mention_tweets, target_reported_botscores))
        #commiting changes
        pgsqlconn.commit()
    except:
        #rolling back transaction and raising to top handler in main
        pgsqlconn.rollback()
        raise
    
#inserts botscore log to database
def botscore_insertion_script(user_id, screen_name, time_stamp, all_bot_scores, bot_score_english, \
                bot_score_universal, requester_ip, tweets_per_day, num_submitted_timeline_tweets, \
                num_submitted_mention_tweets, num_requests):
    try:
        botbase_cursor.execute("""INSERT INTO public.botscore(
                    user_id, screen_name, time_stamp, all_bot_scores, bot_score_english, 
                    bot_score_universal, requester_ip, tweets_per_day, num_submitted_timeline_tweets, 
                    num_submitted_mention_tweets, num_requests) 
                                  VALUES 
                    (%s, %s, to_timestamp(%s), %s, %s, %s, %s, %s, %s, %s, %s);""", \
                    (user_id, screen_name, time_stamp, all_bot_scores, bot_score_english, \
                    bot_score_universal, requester_ip, tweets_per_day, num_submitted_timeline_tweets, \
                    num_submitted_mention_tweets, num_requests))
        #commiting changes
        pgsqlconn.commit()
    except:
        #rolling back transaction and raising to top handler in main
        pgsqlconn.rollback()
        raise

#GLOBAL VARIABLES
total_number_of_lines_parsed = 0
errors_and_informational_count = 0
non_botscore_or_feedback_log = 0
feedback_records_found = 0
non_proper_feedback_log_count = 0
non_proper_botscore_log_count = 0
feedback_records_committed = 0
feedback_fail_commits = 0
botscore_records_found = 0
botscore_records_committed = 0
botscore_fail_commits = 0
json_with_no_type_count = 0
failed_to_retrieve_proper_fields_count = 0

#MAIN CODE
if __name__ == '__main__':
    #connecting to the database
    pgsqlconn = psycopg2.connect(host='', user='', password='', dbname='', port='')
    #cursor needed to execute db operations
    botbase_cursor = pgsqlconn.cursor()
    #starting timer
    timer_start = time.time()
    
    #log name and location information
    log_path = ''
    log_file_list = ['']
   
    #log to store any errors due to the logs not containing the proper data (i.e. other logging information such as errors or other requests)
    error_log_file = open("failsafe-log-insert.err", "a")
  
    #iterating through all log files
    for log in log_file_list:
        print("Starting to import log: ", log)
        sys.stdout.flush()
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
                if not line_json["type"] == "log" and not line_json["type"] == "feedback":
                    non_botscore_or_feedback_log = non_botscore_or_feedback_log + 1
                    continue
            except:
                json_with_no_type_count = json_with_no_type_count + 1
                error_log_file.write("NO-LOG-TYPE-JSON INFO---File: " + log + " LineNumber: " + str(line_num) + " Error: " + str(sys.exc_info()[0]) + "\n")
                continue
                      
            #handling of feedback logs
            if line_json["type"] == "feedback":     
                feedback_records_found = feedback_records_found + 1
                try:
                    source_user_id = line_json['source_user_id']
                except:
                    source_user_id = None
                try:
                    target_user_id = line_json['target_user_id']
                except:
                    error_log_file.write("MISSING-FEEDBACK-TARGET-ID---File: " + log + " LineNumber: " + str(line_num) + " Error: " + str(sys.exc_info()[0]) + "\n")
                    non_proper_feedback_log_count = non_proper_feedback_log_count + 1
                    continue               
                try:
                    target_screen_name = line_json['target_screen_name']
                    if target_screen_name[0:1] == "@":
                        target_screen_name = target_screen_name[1:]
                    if len(target_screen_name) > 15:
                    #user may have a screen-name logged as longer than 15 characters which is not proper in Twitter and could be instead the userid or some other error so we make it none
                        target_screen_name = None
                except:
                    target_screen_name = None                
                try:
                    time_stamp = line_json['time_stamp']
                    #some timestamps are stored in milliseconds so for those we divide by 1000
                    if len(str(time_stamp)) >= 12:
                        time_stamp = time_stamp/1000
                except:
                    time_stamp = None                
                try:
                    feedback_label = line_json['feedback_label']
                except:
                    feedback_label = None
                try:
                    feedback_text = line_json['feedback_text']
                except:
                    feedback_text = None
                try:
                    target_profile = json.loads(line_json['target_profile'])
                    target_profile = json.dumps(target_profile)
                except:                                               
                    target_profile = {}                                                             |                    target_profile['no-profile-found'] = 'No profile was available at the time when this user was reported' 
                    target_profile = json.dumps(target_profile)          
                try:
                    target_timeline_tweets = json.loads(line_json['target_timeline_tweets'])
                    target_timeline_tweets = json.dumps(target_timeline_tweets)
                except:
                    target_timeline_tweets = {}                                                                          target_timeline_tweets['no-timeline-tweets-found'] = 'There were no timeline tweets available at the time when this user was reported'                                                                    target_timeline_tweets = json.dumps(target_timeline_tweets)                
                try:
                    target_mention_tweets = json.loads(line_json['target_mention_tweets'])
                    target_mention_tweets = json.dumps(target_mention_tweets)
                except:
                    target_mention_tweets = {}                                                       
                    target_mention_tweets['no-mention-tweets-found'] = 'There were no mention tweets available at the time when this user was reported'   
                    target_mention_tweets = json.dumps(target_mention_tweets
                try:
                    target_reported_botscores = json.loads(line_json['target_reported_botscores']) 
                    target_reported_botscores = json.dumps(target_reported_botscores)
                except:
                    target_reported_botscores = None 
                #attempting to commit feedback record
                try:
                    feedback_insertion_script(source_user_id, target_user_id, target_screen_name, time_stamp, feedback_label, \
                                  feedback_text, target_profile, target_timeline_tweets, target_mention_tweets, target_reported_botscores)
                    feedback_records_committed = feedback_records_committed + 1
                except:
                    error_log_file.write("DB FEEDBACK INSERTION ERROR---File: " + log + " LineNumber: " + str(line_num) + " Error: " + str(sys.exc_info()[0]) + "\n")
                    feedback_fail_commits = feedback_fail_commits + 1                         

            #handling of botscore logs
            if line_json["type"] == "log":     
                botscore_records_found = botscore_records_found + 1
                try:
                    user_id = line_json['user_id']
                except:
                    error_log_file.write("MISSING-BOTSCORE-USERID---File: " + log + " LineNumber: " + str(line_num) + " Error: " + str(sys.exc_info()[0]) + "\n")
                    non_proper_botscore_log_count = non_proper_botscore_log_count + 1
                    continue  
                try:
                    screen_name = line_json['screen_name']
                    if screen_name[0:1] == "@":
                        screen_name = screen_name[1:]
                    if len(screen_name) > 15:
                    #user may have a screen-name logged as longer than 15 characters which is not proper in Twitter and could be instead the userid or some other error so we make it none
                        screen_name = None
                except:
                    screen_name = None
                try:
                    time_stamp = line_json['time_stamp']
                    #some timestamps are stored in milliseconds so for those we divide by 1000
                    if len(str(time_stamp)) >= 12:
                        time_stamp = time_stamp/1000                    
                except:
                    time_stamp = None                    
                try:
                    all_bot_scores = json.loads(line_json['all_bot_scores'])
                    all_bot_scores = json.dumps(all_bot_scores)
                except:
                    all_bot_scores = None
                try:
                    bot_score_english = line_json['bot_score_english']
                except:
                    bot_score_english = None
                try:
                    bot_score_universal = line_json['bot_score_universal']
                except:
                    bot_score_universal = None
                try:
                    requester_ip = line_json['requester_ip']
                except:
                    requester_ip = None
                try:
                    tweets_per_day = line_json['tweets_per_day']
                except:
                    tweets_per_day = None
                try:
                    num_submitted_timeline_tweets = line_json['num_submitted_timeline_tweets']
                except:
                    num_submitted_timeline_tweets = None
                try:
                    num_submitted_mention_tweets = line_json['num_submitted_mention_tweets']
                except:
                    num_submitted_mention_tweets = None
                try:
                    num_requests = line_json['num_requests']
                except:
                    num_requests = 0
                    
                #attempting to commit botscore record
                try:
                    botscore_insertion_script(user_id, screen_name, time_stamp, all_bot_scores, bot_score_english, \
                                  bot_score_universal, requester_ip, tweets_per_day, num_submitted_timeline_tweets, num_submitted_mention_tweets, num_requests)
                    botscore_records_committed = botscore_records_committed + 1
                except:
                    error_log_file.write("DB BOTSCORE INSERTION ERROR---File: " + log + " LineNumber: " + str(line_num) + " Error: " + str(sys.exc_info()[0]) + "\n")
                    botscore_fail_commits = botscore_fail_commits + 1  
        print("Finished importing log: ", log)
        sys.stdout.flush()

    #closing access to database
    botbase_cursor.close()
    pgsqlconn.close()

    #closing log files
    log_file.close()
    error_log_file.close()

    #ending and evaluating time elapsed
    print("%s seconds elapsed" % (time.time()-timer_start))
    print("Failsafe Log Import Process Completed!")
    
    #printing log statistics
    print("LOG IMPORT PROCESS INFORMATION:")
    print("total-lines-parsed: ", total_number_of_lines_parsed)
    print("non-json-lines: ",errors_and_informational_count)
    print("non-proper-json-lines: ",json_with_no_type_count)
    print("non-botscore-or-feedback-logs: ",non_botscore_or_feedback_log)    
    print("feedback-records-found: ",feedback_records_found)     
    print("feedback-records-successfully-committed: ",feedback_records_committed) 
    print("non-proper-feedback-log-count: ",non_proper_feedback_log_count)  
    print("feedback-logs-failed-to-be-committed: ",feedback_fail_commits)  
    print("botscore-records-found: ",botscore_records_found)     
    print("botscore-records-successfully-committed: ",botscore_records_committed) 
    print("non-proper-botscore-log-count: ",non_proper_botscore_log_count)  
    print("botscore-logs-failed-to-be-committed: ",botscore_fail_commits)      



