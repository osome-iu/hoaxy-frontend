# -*- coding: utf8 -*-
from dbmodels import api, BotbaseModel, db
from flask import jsonify, request
import ConfigParser
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
                Get user scores with '/api/scores?userIDs=id1,id2,id3' or
                '/api/scores?usernames=name1,name2,name3'
                ."""


@api.route("/api/scores", methods=["GET", "POST"])
def getScores():
    """
    The scorese retrival endpoint.
    Parse the query string, get user scores according to user_ids then return as json.
    """
    # get the query string according to different HTTP methods
    if request.method == "GET":
        user_ids_string = request.args.get("userIDs")
        user_names_string = request.args.get("usernames")
    elif request.method == "POST":
        query_file = request.get_json()
        user_ids_string = query_file.get("userIDs")
        user_names_string = query_file.get("usernames")
    else:
        return jsonify(None)

    # parse the query string according to the type
    if user_ids_string:
        user_ids = map(int, user_ids_string.split(","))
        user_identifiers = (dbQueryUserID, user_ids)
    elif user_names_string:
        user_names = user_names_string.split(",")
        user_identifiers = (dbQueryUserScreenName, user_names)
    else:
        return jsonify(None)

    # load the config file
    config_file = ConfigParser.ConfigParser()
    config_file.read("./config.cfg")

    # process the queries
    user_scores = dict()
    for user_identifier in user_identifiers[1]:
        user_entries = user_identifiers[0](user_identifier)
        if user_entries:
            # see how the results are ordered to decide 0 or -1
            user_latest_entry = user_entries[0]
            user_entry_status = getUserRecordStatus(user_latest_entry, config_file)
            user_scores[user_identifier] = {
                "scores": user_latest_entry.all_bot_scores,
                "fresh": user_entry_status
            }
            user_latest_entry.num_requests += 1
        else:
            user_scores[user_identifier] = None
    db.session.commit()
    return jsonify(user_scores)


if __name__ == "__main__":
    api.run(debug=True)
