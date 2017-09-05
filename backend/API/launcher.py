# -*- coding: utf8 -*-
from dbmodels import api, BotbaseModel
from flask import jsonify, request
import ConfigParser
from datetime import datetime


def queryStringParser(query_string):
    """
    query_string   str: the query string with the format "userid1,userid2,userid3"
    return        list: a list of user ids
    """
    return map(int, query_string.split(","))


def getUserScore(user_id):
    """
    user_id    int: user id
    return    json: the user's scores
              None: if fail to get the user's scores
    """
    # load the configurations
    Config = ConfigParser.ConfigParser()
    Config.read("./config.cfg")
    age_min = int(Config.get("FlowChart", "age_min"))
    age_max = int(Config.get("FlowChart", "age_max"))
    reqs_max = int(Config.get("FlowChart", "reqs_max"))
    # BotbaseModel does not support indexing?
    user_entries = BotbaseModel.query.filter(BotbaseModel.user_id == user_id).order_by(BotbaseModel.time_stamp).all()
    if user_entries:
        # see how the results are ordered to decide 0 or -1
        user_latest_entry = user_entries[0]
        timedelta_age = datetime.now() - datetime(user_latest_entry.time_stamp)
        age = timedelta_age.total_seconds()

        if age < age_min:
            return  user_latest_entry.all_bot_scores
        elif age > age_max:
            return computeNewScore(user_id)
        else:
            expected_tweets = age * user_latest_entry.tweets_per_day / 86400.
            if(expected_tweets > 100 or user_latest_entry.num_requests > reqs_max):
                return computeNewScore(user_id)
            else:
                return user_latest_entry.all_bot_scores
    else:
        return computeNewScore(user_id)


@api.route("/")
def hello():
    return """Welcome to the Hoaxy-Botometer API.\nGet user scores with '/api/
                scores?query=userid1,userid2,userid3'."""


@api.route("/api/scores", methods=["GET"])
def getScores():
    """
    The scorese retrival endpoint.
    Parse the query string, get user scores according to user_ids then return as json.
    """
    # parse the query string
    user_ids_string = request.args.get("userIDs")
    if user_ids_string:
        user_ids = map(int, user_ids.split(","))

    user_names_string = request.args.get("usernames")
    if user_names_string:
        user_names = user_names_string.split(",")

    user_id_list = queryStringParser(request.args["query"])

    # initialize the dict to store the scores
    user_scores = dict()

    # try to get all the scores
    for user_id in user_id_list:
        user_score = getUserScore(user_id)
        if user_score:
            user_scores[user_id] = user_score
    return jsonify(user_scores)


if __name__ == "__main__":
    api.run(debug=True)
