# -*- coding: utf8 -*-
from dbmodels import api, BotbaseModel
from flask import jsonify, request


def queryStringParser(query_string):
    """
    query_string : the query string with the format "userid1,userid2,userid3"
    return       : a list of user ids
    """
    return map(int, query_string.split(","))


@api.route("/")
def hello():
    return """Welcome to the Hoaxy-Botometer API.\nGet user scores with '/api/
                scores?query=userid1,userid2,userid3'."""


@api.route("/api/scores", methods=["GET"])
def getScores():
    user_id_list = queryStringParser(request.args["query"])
    user_scores = dict()
    for user_id in user_id_list:
        user_info = BotbaseModel.query.filter(BotbaseModel.user_id == user_id).all()
        if user_info:
            user_scores[user_id] = user_info[0].all_bot_scores
    return jsonify(user_scores)


if __name__ == "__main__":
    api.run(debug=True)
