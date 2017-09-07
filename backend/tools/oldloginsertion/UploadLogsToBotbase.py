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
    log_file_list = ['botornot.log201506']
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

        for line_num, line in enumerate(log_file):
            try: 
                line_json = json.loads(line)
                user_id = line_json["search"]["user_id"]
                screen_name = line_json["search"]["sn"]
                time_stamp = line_json["timestamp"]
                #some timestamps are stored in milliseconds so for those we divide by 1000
                if len(str(time_stamp)) >= 12:
                    time_stamp = time_stamp/1000
                all_bot_scores = line_json["categories"]
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
                    num_requests_new = num_requests_lookup(int(user_id))[0]
                    num_requests_new = num_requests_new + 1
                except TypeError:
                    #user does not exist yet in the database
                    num_requests_new = 1
                #inserting data to the database
                log_insertion_script(user_id, screen_name, time_stamp, all_bot_scores, bot_score_english, bot_score_universal, \
                            str(requester_ip), tweets_per_day, num_tweets, num_mentions, latest_tweet_timestamp, num_requests_new, user_profile)
            except:
                error_log_file.write("File: " + log + " LineNumber: " + str(line_num) + " Error: " + str(sys.exc_info()[0]) + "\n")
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
