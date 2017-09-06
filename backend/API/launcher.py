# -*- coding: utf8 -*-
from dbmodels import api, BotbaseModel
from flask import jsonify, request
#import ConfigParser
#from datetime import datetime


def queryStringParser(query_string):
    """
    query_string   str: the query string with the format "userid1,userid2,userid3"
    return        list: a list of user ids
    """
    return map(int, query_string.split(","))


#def getUserScore(user_id):
    #"""
    #user_id    int: user id
    #return    json: the user's scores
              #None: if fail to get the user's scores
    #"""
    ## load the configurations
    #Config = ConfigParser.ConfigParser()
    #Config.read("./config.cfg")
    #age_min = int(Config.get("FlowChart", "age_min"))
    #age_max = int(Config.get("FlowChart", "age_max"))
    #reqs_max = int(Config.get("FlowChart", "reqs_max"))
    ## BotbaseModel does not support indexing?
    #user_entries = BotbaseModel.query.filter(BotbaseModel.user_id == user_id).order_by(BotbaseModel.time_stamp).all()
    #if user_entries:
        ## see how the results are ordered to decide 0 or -1
        #user_latest_entry = user_entries[0]
        #timedelta_age = datetime.now() - datetime(user_latest_entry.time_stamp)
        #age = timedelta_age.total_seconds()

        #if age < age_min:
            #return  user_latest_entry.all_bot_scores
        #elif age > age_max:
            #return computeNewScore(user_id)
        #else:
            #expected_tweets = age * user_latest_entry.tweets_per_day / 86400.
            #if(expected_tweets > 100 or user_latest_entry.num_requests > reqs_max):
                #return computeNewScore(user_id)
            #else:
                #return user_latest_entry.all_bot_scores
    #else:
        #return computeNewScore(user_id)


def dbQueryUserID(user_id):
    return BotbaseModel.query.filter(BotbaseModel.user_id == user_id).order_by(BotbaseModel.time_stamp).all()


def dbQueryUserScreenName(user_name):
    return BotbaseModel.query.filter(BotbaseModel.screen_name == user_name).order_by(BotbaseModel.time_stamp).all()


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
    if request.method == "GET":
        user_ids_string = request.args.get("userIDs")
        user_names_string = request.args.get("usernames")
    if request.method == "POST":
        query_file = request.get_json()
        user_ids_string = query_file.get("userIDs")
        user_name_string = query_file.get("usernames")
    else:
        return jsonify(None)

    if user_ids_string:
        user_ids = map(int, user_ids_string.split(","))
        user_identifiers = (dbQueryUserID, user_ids)
    elif user_names_string:
        user_names = user_names_string.split(",")
        user_identifiers = (dbQueryUserScreenName, user_names)
    else:
        return jsonify(None)

    user_scores = dict()
    for user_identifier in user_identifiers[1]:
        user_entries = user_identifiers[0](user_identifier)
        if user_entries:
            # see how the results are ordered to decide 0 or -1
            user_latest_entry = user_entries[0]
            user_scores[user_identifier] = user_latest_entry.all_bot_scores
        else:
            user_scores[user_identifier] = None

    return jsonify(user_scores)


if __name__ == "__main__":
    api.run(debug=True)
