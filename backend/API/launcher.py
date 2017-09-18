# -*- coding: utf8 -*-
from dbmodels import api, BotbaseModel, db
from flask import jsonify, request
import configparser
from datetime import datetime


def dbQueryUserID(user_id):
    return BotbaseModel.query.filter(BotbaseModel.user_id == user_id).order_by(BotbaseModel.time_stamp).all()


def dbQueryUserScreenName(user_name):
    return BotbaseModel.query.filter(BotbaseModel.screen_name == user_name).order_by(BotbaseModel.time_stamp).all()


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

    user_scores = []
    # parse the query according to the type
    if user_ids_query:
        if isinstance(user_ids_query, list):
            user_ids = map(int, user_ids_query)
        elif isinstance(user_ids_query, str):
            user_ids = map(int, user_ids_query.split(","))
        else:
            user_ids = None

        if user_ids:
            # query all the results
            for user_id in user_ids:
                user_entries = dbQueryUserID(user_id)
                if user_entries:
                    user_latest_entry = user_entries[-1]
                    user_entry_status = getUserRecordStatus(user_latest_entry, config_file)
                    user_scores.append(
                        {
                            "categories": {
                                "friend": user_latest_entry.all_bot_scores["friend"],
                                "sentiment": user_latest_entry.all_bot_scores["sentiment"],
                                "temporal": user_latest_entry.all_bot_scores["temporal"],
                                "user": user_latest_entry.all_bot_scores["user"],
                                "network": user_latest_entry.all_bot_scores["network"],
                                "content": user_latest_entry.all_bot_scores["content"]
                            },
                            "user": {
                                "screen_name": user_latest_entry.screen_name,
                                "id": user_latest_entry.user_id
                            },
                            "scores": {
                                "english": user_latest_entry.bot_score_english,
                                "universal": user_latest_entry.bot_score_universal
                            },
                            "fresh": user_entry_status,
                            "timestamp": user_latest_entry.time_stamp
                        }
                    )
                else:
                    user_scores.append(
                        {
                            "categories": {
                                "friend": None,
                                "sentiment": None,
                                "temporal": None,
                                "user": None,
                                "network": None,
                                "content": None,
                            },
                            "user": {
                                "screen_name": None,
                                "id": user_id
                            },
                            "scores": {
                                "english": None,
                                "universal": None
                            },
                            "fresh": None,
                            "timestamp": None
                        }
                    )

    if user_names_query:
        if isinstance(user_names_query, list):
            user_names = user_names_query
        elif isinstance(user_names_query, str):
            user_names = user_names_query.split(",")
        # query all the results
        else:
            user_names = None

        if user_names:
            for user_name in user_names:
                user_entries = dbQueryUserScreenName(user_name)
                if user_entries:
                    user_latest_entry = user_entries[-1]
                    user_entry_status = getUserRecordStatus(user_latest_entry, config_file)
                    user_scores.append(
                        {
                            "categories": {
                                "friend": user_latest_entry.all_bot_scores["friend"],
                                "sentiment": user_latest_entry.all_bot_scores["sentiment"],
                                "temporal": user_latest_entry.all_bot_scores["temporal"],
                                "user": user_latest_entry.all_bot_scores["user"],
                                "network": user_latest_entry.all_bot_scores["network"],
                                "content": user_latest_entry.all_bot_scores["content"]
                            },
                            "user": {
                                "screen_name": user_latest_entry.screen_name,
                                "id": user_latest_entry.user_id
                            },
                            "scores": {
                                "english": user_latest_entry.bot_score_english,
                                "universal": user_latest_entry.bot_score_universal
                            },
                            "fresh": user_entry_status,
                            "timestamp": user_latest_entry.time_stamp
                        }
                    )
                else:
                    user_scores.append(
                        {
                            "categories": {
                                "friend": None,
                                "sentiment": None,
                                "temporal": None,
                                "user": None,
                                "network": None,
                                "content": None,
                            },
                            "user": {
                                "screen_name": user_name,
                                "id": None
                            },
                            "scores": {
                                "english": None,
                                "universal": None
                            },
                            "fresh": None,
                            "timestamp": None
                        }
                    )

    return jsonify(user_scores)


if __name__ == "__main__":
    api.run(debug=True)
