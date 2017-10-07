#!/usr/bin/env python

#Author: Mihai Avram, e-mail: mihai.v.avram@gmail.com

#TODO BEFORE RUNNING: Change database configuration settings in pgsqlconn and also log_path

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
                              feedback_text, target_profile, target_timeline_tweets, target_mention_tweets):
    
    botbase_cursor.execute("""INSERT INTO public.feedback(source_user_id, target_user_id, target_screen_name, time_stamp, feedback_label,
                        feedback_text, target_profile, target_timeline_tweets, target_mention_tweets) 
                              VALUES 
                (%s, %s, %s, to_timestamp(%s), %s, %s, %s, %s, %s);""", \
                (source_user_id, target_user_id, target_screen_name, time_stamp, feedback_label, \
                feedback_text, target_profile, target_timeline_tweets, target_mention_tweets))

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
text_not_present_logs = 0
    
#MAIN CODE
if __name__ == '__main__':
    #connecting to the database
    pgsqlconn = psycopg2.connect(host='', user='', password='', dbname='', port='')
    #cursor needed to execute db operations
    botbase_cursor = pgsqlconn.cursor()
    #starting timer
    timer_start = time.time()
    
    #log name and location information
    #log_path = '/home/mavram/Research/HoaxyBotometer/ImportBackuplogsTask/logs/backups/unzipstage/'

    log_path = ''
    
    log_file_list = ['botornot.log201506', 'botornot.log201510', 'botornot.log201605', 'botornot.log201701' ,'botornot.log201702', 'botornot.log201705', 'botornot.log.2017-05-14', 'botornot.log.2017-05-21', 'botornot.log.2017-05-28', 'botornot.log.2017-06-04', 'botornot.log.2017-06-11', 'botornot.log.2017-06-18', 'botornot.log.2017-06-25', 'botornot.log.2017-07-02', 'botornot.log.2017-07-09', 'botornot.log.2017-07-16','botornot.log.2017-07-23', 'botornot.log.2017-07-30', 'botornot.log.2017-08-06', 'botornot.log.2017-08-13']
  
    #log to store any errors due to the logs not containing the proper data (i.e. other logging information such as errors or other requests)
    error_log_file = open("feedbackinsertionlog.err", "a")
  
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
                if not line_json["type"] == "flag":
                    json_not_proper_log_count = json_not_proper_log_count + 1
                    continue
            except:
                json_with_no_type_count = json_with_no_type_count + 1
                error_log_file.write("NO-LOG-TYPE-JSON INFO---File: " + log + " LineNumber: " + str(line_num) + " Error: " + str(sys.exc_info()[0]) + "\n")
                continue
                
            #parsing json line and retrieving the proper fields regarding the user i.e. user id, screen name, tweets, etc...
            try:
                source_user_id = None
                target_user_id = line_json["user"]["id"]
                target_screen_name = str(line_json["user"]["screen_name"])
                #changing @screenname to screenname to add to the database if found
                if target_screen_name[0:1] == "@":
                    target_screen_name = target_screen_name[1:]
                if len(target_screen_name) > 15:
                    #user may have a screen-name logged as longer than 15 characters which is not proper in Twitter and could be instead the userid or some other error so we make it none
                    target_screen_name = None
                time_stamp = line_json["timestamp"]
                #some timestamps are stored in milliseconds so for those we divide by 1000
                if len(str(time_stamp)) >= 12:
                    time_stamp = time_stamp/1000
                feedback_label = None
                feedback_text = line_json['text']
                #if there is no feedback text we continue to the next line
                if len(feedback_text) == 0:
                    text_not_present_logs = text_not_present_logs + 1
                    continue
                target_profile = None
                target_timeline_tweets = None
                target_mention_tweets = None
            except:
                error_log_file.write("NON-PROPER-FIELDS ERROR---File: " + log + " LineNumber: " + str(line_num) + " Error: " + str(sys.exc_info()[0]) + "\n")
                failed_to_retrieve_proper_fields_count = failed_to_retrieve_proper_fields_count + 1
                continue
                
            try:
                #inserting data to the database
                feedback_insertion_script(source_user_id, target_user_id, target_screen_name, time_stamp, feedback_label, \
                    feedback_text, target_profile, target_timeline_tweets, target_mention_tweets)
                records_committed = records_committed + 1
            except:
                error_log_file.write("DB INSERTION ERROR---File: " + log + " LineNumber: " + str(line_num) + " Error: " + str(sys.exc_info()[0]) + "\n")
                failed_to_commit_to_db_count = failed_to_commit_to_db_count + 1  
                continue

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
    print("Feedback log Import Process Completed!")
    
    #printing log statistics
    print("LOG IMPORT PROCESS INFORMATION:")
    print("total-lines-parsed: ", total_number_of_lines_parsed)
    print("records-committed: ", records_committed)
    print("non-json-lines: ",errors_and_informational_count)
    print("non-flag-json-type: ", json_not_proper_log_count)
    print("logs-with-text-blank: ", text_not_present_logs) 
    print("json-with-no-type: ", json_with_no_type_count)
    print("non-proper-fields-upon-retrieval: ", failed_to_retrieve_proper_fields_count)
    print("db-commit-failures: ", failed_to_commit_to_db_count)
