# -*- coding: utf8 -*-
import sqlalchemy
from launcher import botscore_connection
import timeit


def dbQueryUserScreenName(user_names):
    result = botscore_connection.execute(
        sqlalchemy.text(
            """
            WITH temptable AS (
                SELECT id, user_id, names.screen_name, all_bot_scores, bot_score_english, bot_score_universal, time_stamp, tweets_per_day, num_submitted_timeline_tweets, num_requests
                FROM botscore
                JOIN UNNEST(:screen_names) AS names(screen_name) ON botscore.screen_name = names.screen_name
            )
            SELECT id, user_id, screen_name, all_bot_scores, bot_score_english, bot_score_universal, time_stamp, tweets_per_day, num_submitted_timeline_tweets, num_requests
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
    first_n_lines = []
    with open("./randnamelist.txt") as f:
        for i in range(num):
            first_n_lines.append(f.readline().strip())
    return first_n_lines


if __name__ == "__main__":
    print("dbQueryUserScreenName(prepareNameList(10))", setup="from __main__ import *")
