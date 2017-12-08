#!/usr/bin/env python

#Author: Mihai Avram, e-mail: mihai.v.avram@gmail.com

#TODO BEFORE RUNNING: Change database configuration settings in pgsqlconn and also log_path, as well as the log_file_list with the files one wants to upload
#Also it is advised to run the query from duplicate_botscore_lookup function on the database explicitly to see how many records are indeed duplicates, i.e.
#dump the results of the query into a file and do a wc -l <file> in bash to see how many lines there are (lines = duplicate tuples) if there are a lot
#it is best to limit the query in the duplicate_botscore_lookup function doing a LIMIT 100000 to only do batches of 100000 at a time.

#ALL IMPORTS
#for parsing the data in the logs
import json
#for connecting to the database
import psycopg2
#for error logging
import sys, traceback
#for timing purposes
import time
#for writing data to a file
import csv

#can be used for debugging if exceptions start to occur
def print_exception():
    exc_type, exc_value, exc_traceback = sys.exc_info()
    traceback.print_exception(exc_type, exc_value, exc_traceback, limit=3, file=sys.stdout)

#ALL FUNCTIONS
    
#looks up botscore duplicates
def duplicate_botscore_lookup():
    try:
        botbase_cursor.execute("""SELECT user_id, requester_ip, time_stamp FROM botscore GROUP BY user_id, requester_ip, time_stamp HAVING count(*) > 1;""")
        duplicate_botscore_records = botbase_cursor.fetchall()
        return(duplicate_botscore_records)
    except:
        #raising to top handler in main
        error_log_file.write("FIND ALL BOTSCORE DUPLICATES QUERY FAILED---" + str(sys.exc_info()[0]) + "\n")

#retrieve total num_requests
def get_total_num_requests(user_id, requester_ip, time_stamp):
    try:
        botbase_cursor.execute("""SELECT SUM(num_requests) FROM botscore WHERE user_id=%s AND requester_ip=%s AND time_stamp=%s;""",(user_id, requester_ip, time_stamp))
        total_num_requests = botbase_cursor.fetchone()
        return(total_num_requests[0])
    except:
        #raising to top handler in main
        raise

#updating the least recent (oldest by id) botscore with the sum of the num_requests for all duplicates
def update_num_requests(total_num_requests, user_id, requester_ip, time_stamp):
    try:
        botbase_cursor.execute("""UPDATE botscore SET num_requests=%s WHERE id=(SELECT MIN(dup.id) FROM (SELECT id FROM botscore WHERE user_id=%s AND requester_ip=%s AND time_stamp=%s) as dup);""",(total_num_requests, user_id, requester_ip, time_stamp))
        #commiting changes
        pgsqlconn.commit()
    except:
        #rolling back transaction and raising to top handler in main
        pgsqlconn.rollback()
        raise

#storing all deleted records in a file just in case
def storage_of_deleted_duplicates(user_id, requester_ip, time_stamp):
    try:
        botbase_cursor.execute("""
        SELECT * FROM botscore WHERE user_id=%s
		AND requester_ip=%s
		AND time_stamp=%s
		AND id <> (SELECT MIN(dup.id) FROM (SELECT id FROM botscore 
        WHERE user_id=%s AND requester_ip=%s AND time_stamp=%s) as dup)""",(user_id, requester_ip, time_stamp, user_id, requester_ip, time_stamp))
        #retrieving all deleted records for this duplicate tuple
        all_records_about_to_be_deleted = botbase_cursor.fetchall()
        return(all_records_about_to_be_deleted)
    except:
        #raising to top handler in main
        raise
        
#deleting all duplicates, only the oldest duplicate remaining as a singleton
def delete_all_other_duplicates_besides_oldest(user_id, requester_ip, time_stamp):
    try:
        botbase_cursor.execute("""
        DELETE FROM botscore WHERE user_id=%s
		AND requester_ip=%s
		AND time_stamp=%s
		AND id <> (SELECT MIN(dup.id) FROM (SELECT id FROM botscore 
        WHERE user_id=%s AND requester_ip=%s AND time_stamp=%s) as dup)""",(user_id, requester_ip, time_stamp, user_id, requester_ip, time_stamp))
        #commiting changes
        pgsqlconn.commit()
    except:
        #rolling back transaction and raising to top handler in main
        pgsqlconn.rollback()
        raise  

#GLOBAL VARIABLES
duplicates_found = 0
duplicates_failed_to_be_updated = 0
num_requests_updated = 0
num_duplicate_tuples_deleted = 0
duplicate_tuples_failed_to_be_deleted = 0
total_deleted_records = 0

#MAIN CODE
if __name__ == '__main__':
    #connecting to the database
    pgsqlconn = psycopg2.connect(host='', user='', password='', dbname='', port='')
    #cursor needed to execute db operations
    botbase_cursor = pgsqlconn.cursor()
    #starting timer
    timer_start = time.time()
       
    #log to store any errors due to the logs not containing the proper data (i.e. other logging information such as errors or other requests)
    error_log_file = open("deleted-botscore-duplicates.err", "a")
    deleted_duplicates_file = open("deleted-botscore-duplicates.csv", "a")
    deleted_duplicates_file_writer = csv.writer(deleted_duplicates_file)

    #looking up duplicates
    botscore_duplicates = duplicate_botscore_lookup()

    #iterating through all duplicates
    for botscore_duplicate in botscore_duplicates:
        duplicates_found = duplicates_found + 1 
        user_id = str(botscore_duplicate[0])
        requester_ip = str(botscore_duplicate[1])
        time_stamp = str(botscore_duplicate[2])
        #retrieving total num_requests for the duplicate
        try:
            total_num_requests = str(get_total_num_requests(user_id, requester_ip, time_stamp))
        except:
            error_log_file.write("COULD NOT RETRIEVE TOTAL num_requests FROM DUPLICATE---user_id: " + str(user_id) + " requester_ip: " + str(requester_ip) + " time_stamp: " + str(time_stamp) + " error: " + str(sys.exc_info()[0]) + "\n")
            duplicates_failed_to_be_updated = duplicates_failed_to_be_updated + 1
            continue
            
        #updating the least recent (oldest by id) botscore with the sum of the num_requests for all duplicates
        try:
            update_num_requests(total_num_requests, user_id, requester_ip, time_stamp)
            num_requests_updated = num_requests_updated + 1
        except:
            error_log_file.write("COULD NOT UPDATE num_requests ON OLDEST DUPLICATE---user_id: " + str(user_id) + " requester_ip: " + str(requester_ip) + " time_stamp: " + str(time_stamp) + " total_num_requests: " + str(total_num_requests) + "error: " + str(sys.exc_info()[0]) + "\n")
            duplicates_failed_to_be_updated = duplicates_failed_to_be_updated + 1
            continue
            
        #printing all duplicate tuples about to be deleted to a file just in case we make a mistake
        try:
            all_records_about_to_be_deleted = storage_of_deleted_duplicates(user_id, requester_ip, time_stamp)
            for rec_to_be_del in all_records_about_to_be_deleted:
                deleted_duplicates_file_writer.writerow(list(rec_to_be_del))
                total_deleted_records = total_deleted_records + 1
        except:
            error_log_file.write("COULD NOT RETRIEVE OTHER DUPLICATES---user_id: " + str(user_id) + " requester_ip: " + str(requester_ip) + " requester_ip: " + str(time_stamp) + " total_num_requests: " + str(total_num_requests) + "error: " + str(sys.exc_info()[0]) + "\n")
            duplicate_tuples_failed_to_be_deleted = duplicate_tuples_failed_to_be_deleted + 1
            continue
            
        #deleting all other duplicates, only the oldest one remaining
        try:
            delete_all_other_duplicates_besides_oldest(user_id, requester_ip, time_stamp)
            num_duplicate_tuples_deleted = num_duplicate_tuples_deleted + 1
        except:
            error_log_file.write("COULD NOT DELETE OTHER DUPLICATES---user_id: " + str(user_id) + " requester_ip: " + str(requester_ip) + " requester_ip: " + str(time_stamp) + " total_num_requests: " + str(total_num_requests) + "error: " + str(sys.exc_info()[0]) + "\n")
            duplicate_tuples_failed_to_be_deleted = duplicate_tuples_failed_to_be_deleted + 1
            continue
            
            
    #closing access to database
    botbase_cursor.close()
    pgsqlconn.close()

    #closing log files
    error_log_file.close()
    deleted_duplicates_file.close()

    #ending and evaluating time elapsed
    print("%s seconds elapsed" % (time.time()-timer_start))
    print("Botometer botscore duplicate records deletion completed!")
    
    #printing log statistics
    print("duplicates_found: ",duplicates_found)
    print("duplicates_failed_to_be_updated: ",duplicates_failed_to_be_updated)
    print("num_requests_updated: ", num_requests_updated)
    print("num_duplicate_tuples_deleted: ", num_duplicate_tuples_deleted)
    print("duplicate_tuples_failed_to_be_deleted: ", duplicate_tuples_failed_to_be_deleted)
    print("total_deleted_records: ", total_deleted_records)
