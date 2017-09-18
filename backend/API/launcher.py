# -*- coding: utf8 -*-
#from dbmodels import api, BotbaseModel, db
import sqlalchemy
from flask import Flask, jsonify, request
import configparser
from datetime import datetime

api = Flask(__name__)
botscore_engine = sqlalchemy.create_engine("postgresql://localhost/botbase")
botscore_connection = botscore_engine.connect()


def dbQueryUserID(user_ids):
    result = botscore_connection.execute(
        sqlalchemy.text(
            """
            SELECT id, ids.user_id, screen_name, all_bot_scores, bot_score_english, bot_score_universal, time_stamp, tweets_per_day, num_tweets, num_requests
            FROM botscore
            RIGHT JOIN UNNEST(:user_ids) AS ids(user_id)
            ON botscore.user_id = ids.user_id
            """
        ),
        {
            "user_ids" : user_ids
        }
    )
    return result


def dbQueryUserScreenName(user_names):
    result = botscore_connection.execute(
        sqlalchemy.text(
            """
            SELECT id, user_id, names.screen_name, all_bot_scores, bot_score_english, bot_score_universal, time_stamp, tweets_per_day, num_tweets, num_requests
            FROM botscore
            RIGHT JOIN UNNEST(:screen_names) AS names(screen_name)
            ON botscore.screen_name = names.screen_name
            """
        ),
        {
            "screen_names" : user_names
        }
    )
    return result


def getUserRecordStatus(user_entry, config_file):
    timedelta_age = datetime.now() - user_entry.time_stamp.replace(tzinfo=None)
    age_of_user = timedelta_age.total_seconds()

    if age_of_user < int(config_file.get("FlowChart", "age_min")):
        return True
    elif age_of_user > int(config_file.get("FlowChart", "age_max")):
        return False
    else:
        if user_entry.tweets_per_day:
            expected_tweets = age_of_user * user_entry.tweets_per_day / 86400.
            if expected_tweets > int(config_file.get("FlowChart", "expected_tweets_max")) or user_entry.num_requests > int(config_file.get("FlowChart", "reqs_max")):
                return False
            else:
                return True
        else:
            return False


@api.route("/")
def hello():
    return """Welcome to the Hoaxy-Botometer API.\n
                Get user scores with '/api/scores?user_id=id1,id2,id3' or
                '/api/scores?screen_name=name1,name2,name3'
                ."""


@api.route("/api/scores", methods=["GET", "POST"])
def getScores():
    """
    The scorese retrival endpoint.
    Parse the query string, get user scores according to user_ids then return as json.
    """
    # get the query string according to different HTTP methods
    if request.method == "GET":
        user_ids_query = request.args.get("user_id")
        user_names_query = request.args.get("screen_name")
    elif request.method == "POST":
        query_file = request.get_json()
        user_ids_query = query_file.get("user_id")
        user_names_query = query_file.get("screen_name")
    else:
        return jsonify(None)

    # load the config file
    config_file = configparser.ConfigParser()
    config_file.read("./config.cfg")

    # parse the query according to the type
    db_results = []
    if user_ids_query:
        if isinstance(user_ids_query, list):
            user_ids = list(map(int, user_ids_query))
        elif isinstance(user_ids_query, str):
            user_ids = list(map(int, user_ids_query.split(",")))
        db_results += dbQueryUserID(user_ids)


    if user_names_query:
        if isinstance(user_names_query, list):
            user_names = user_names_query
        elif isinstance(user_names_query, str):
            user_names = user_names_query.split(",")
        db_results += dbQueryUserScreenName(user_names)

    user_scores = []

    for row in db_results:
        if row[3]:
            all_bot_scores = row[3]
        else:
            all_bot_scores = {}
        user_record = {
            "categories": {
                "friend": all_bot_scores.get("friend"),
                "sentiment": all_bot_scores.get("sentiment"),
                "temporal": all_bot_scores.get("temporal"),
                "user": all_bot_scores.get("user"),
                "network": all_bot_scores.get("network"),
                "content": all_bot_scores.get("content")
            },
            "user": {
                "screen_name": row[2],
                "id": row[1]
            },
            "scores": {
                "english": row[4],
                "universal": row[5]
            },
            "timestamp": row[6]
        }
        user_scores.append(user_record)

    #db.session.commit()
    return jsonify(user_scores)


if __name__ == "__main__":
    api.run(debug=True)
