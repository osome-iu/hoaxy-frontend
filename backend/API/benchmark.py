# -*- coding: utf8 -*-
import sqlalchemy
import timeit
import random
import time
import json

botscore_engine = sqlalchemy.create_engine("postgresql://botometer@recall.ils.indiana.edu:5433/botometer")
botscore_connection = botscore_engine.connect()

def dbPreRun():
    result = botscore_connection.execute(
        sqlalchemy.text(
            """
            select screen_name from botscore limit 1;
            """
        ))
    return result


def dbQueryRandomSample(ids):
    result = botscore_connection.execute(
        sqlalchemy.text(
            """
            select screen_name from botscore
            where id in :ids
            """
        ),
        {
            "ids": tuple(ids)
        }
    )
    return result


def dbQueryUserScreenNameInExplain(user_names):
    result = botscore_connection.execute(
        sqlalchemy.text(
            """
            explain analyze
            SELECT DISTINCT ON (screen_name) id, user_id, screen_name, all_bot_scores, bot_score_english, bot_score_universal, time_stamp, tweets_per_day, num_requests
            from botscore
            where screen_name IN :screen_names
            ORDER BY screen_name, time_stamp DESC
            """
        ),
        {
            "screen_names": tuple(user_names)
        }
    )
    return result


def dbQueryUserScreenNameIn(user_names):
    result = botscore_connection.execute(
        sqlalchemy.text(
            """
            SELECT DISTINCT ON (screen_name) id, user_id, screen_name, all_bot_scores, bot_score_english, bot_score_universal, time_stamp, tweets_per_day, num_requests
            from botscore
            where screen_name IN :screen_names
            ORDER BY screen_name, time_stamp DESC
            """
        ),
        {
            "screen_names": tuple(user_names)
        }
    )
    return result


def dbQueryUserAllRecords(user_names):
    result = botscore_connection.execute(
        sqlalchemy.text(
            """
            SELECT user_id, screen_name, bot_score_english, bot_score_universal, time_stamp
            from botscore
            where screen_name IN :screen_names
            """
        ),
        {
            "screen_names": tuple(user_names)
        }
    )
    return result


def dbQueryUserScreenName(user_names):
    result = botscore_connection.execute(
        sqlalchemy.text(
            """
            WITH temptable AS (
                SELECT id, user_id, names.screen_name, all_bot_scores, bot_score_english, bot_score_universal, time_stamp, tweets_per_day, num_requests
                FROM botscore
                JOIN UNNEST(:screen_names) AS names(screen_name) ON botscore.screen_name = names.screen_name
            )
            SELECT id, user_id, screen_name, all_bot_scores, bot_score_english, bot_score_universal, time_stamp, tweets_per_day, num_requests
            from temptable
            JOIN (
                SELECT temptable.screen_name AS latest_user_screen_name, max(time_stamp) AS latesttimestamp
                FROM temptable
                GROUP BY temptable.screen_name
            ) AS latesttable
            ON temptable.screen_name = latesttable.latest_user_screen_name AND temptable.time_stamp = latesttable.latesttimestamp
            """
        ),
        {
            "screen_names": user_names
        }
    )
    return result


def prepareNameList(num):
    with open("./randnamelist.txt") as f:
        file_lines = f.readlines()
    rand_index = random.sample(range(len(file_lines)), num)
    lines = []
    for item in rand_index:
        lines.append(file_lines[item].strip())
    return lines


def readNameListFromFile(url):
    with open(url) as f:
        file_lines = f.readlines()
    return list(map(lambda x: x.strip(), file_lines))


def genRandomNumber(num):
    return random.sample(range(20000000), num)


def continousRun(times):
    dbPreRun()

    #name_list_s = []

    whole_time = 0
    for i in range(times):
        ids = genRandomNumber(1000)
        q_result = dbQueryRandomSample(ids)
        name_list = list(map(lambda x: x[0], list(q_result)))
        #name_list_s.append(set(name_list))
        t1 = time.time()
        db_result = dbQueryUserScreenNameIn(name_list)
        t2 = time.time()
        print("%d %.3f" % (i, t2-t1))
        whole_time += t2 - t1
    print(whole_time)
    #whole = set()
    #for item in name_list_s:
        #whole = whole | item
    #print(len(whole))

def explain():
        ids = genRandomNumber(1000)
        q_result = dbQueryRandomSample(ids)
        name_list = list(map(lambda x: x[0], list(q_result)))
        #name_list_s.append(set(name_list))
        t1 = time.time()
        db_result = dbQueryUserScreenNameInExplain(name_list)
        t2 = time.time()
        for line in db_result:
            print(line)
        print("%.4f" % (t2-t1))


if __name__ == "__main__":
    #print("hello")
    #print(prepareNameList(10))
    #print(timeit.timeit("dbQueryUserScreenName(name_list)", setup="from __main__ import dbQueryUserScreenName, prepareNameList\nname_list=prepareNameList(1000)", number=1))
    #name_list = prepareNameList(10)
    #dbQueryUserScreenName(name_list)
    #print(prepareNameList(10))
    #name_list = prepareNameList(10)
    #name_list = ["Fontane_opr", "kwautuh_peace", "claireclose"]
    #resultIn = dbQueryUserScreenNameIn(name_list)
    #result = dbQueryUserScreenName(name_list)
    #for i in result:
    #    print(i)
#
#    for i in resultIn:
#        print(i)

    #continousRun(20)
    #explain()

    the_list = readNameListFromFile("./tweet280list.txt")
    db_results = dbQueryUserAllRecords(the_list)
    with open("./tweet280dbresults.txt", "w") as f:
        for db_result in db_results:
            for item in db_result:
                f.write(str(item))
                f.write(",")
            f.write("\n")
