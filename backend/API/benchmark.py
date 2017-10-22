# -*- coding: utf8 -*-
import sqlalchemy
from launcher import botscore_connection
import timeit
import random


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


if __name__ == "__main__":
    #print("hello")
    #print(prepareNameList(10))
    #print(timeit.timeit("dbQueryUserScreenName(name_list)", setup="from __main__ import dbQueryUserScreenName, prepareNameList\nname_list=prepareNameList(1000)", number=1))
    #name_list = prepareNameList(10)
    #dbQueryUserScreenName(name_list)
    #print(prepareNameList(10))
    #name_list = prepareNameList(10)
    name_list = ["Fontane_opr", "kwautuh_peace", "claireclose"]
    resultIn = dbQueryUserScreenNameIn(name_list)
    result = dbQueryUserScreenName(name_list)
    for i in result:
        print(i)

    for i in resultIn:
        print(i)
