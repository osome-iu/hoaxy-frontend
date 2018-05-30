# -*- coding: utf8 -*-
import sqlalchemy
from flask import Flask, jsonify, request, render_template
from flask_basicauth import BasicAuth
from flask_cors import CORS
import configparser
from datetime import datetime
import time
from collections import Counter

api = Flask(__name__)
CORS(api)
connection_string = open('.db.connection').read()
botscore_engine = sqlalchemy.create_engine(connection_string)
botscore_connection = botscore_engine.connect()

with open(".pass") as f:
    api.config['BASIC_AUTH_USERNAME'], api.config['BASIC_AUTH_PASSWORD'] = f.readline().strip().split(",")
basic_auth = BasicAuth(api)


def dbQueryUserIDIn(user_ids):
    result = botscore_connection.execute(
        sqlalchemy.text(
            """
            SELECT DISTINCT ON (user_id) id, user_id, screen_name, all_bot_scores, bot_score_english, bot_score_universal, time_stamp, tweets_per_day, num_submitted_timeline_tweets, num_requests
            FROM botscore
            WHERE user_id IN :user_ids
            ORDER BY user_id, time_stamp DESC
            """
        ),
        {
            "user_ids": tuple(user_ids)
        }
    )
    return result


def dbQueryUserScreenNameIn(user_names):
    result = botscore_connection.execute(
        sqlalchemy.text(
            """
            SELECT DISTINCT ON (screen_name) id, user_id, screen_name, all_bot_scores, bot_score_english, bot_score_universal, time_stamp, tweets_per_day, num_submitted_timeline_tweets, num_requests
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


def dbQueryFeedback():
    result = botscore_connection.execute(
        sqlalchemy.text(
            """
            SELECT id, target_screen_name, feedback_label, feedback_text, time_stamp
            from feedback
            """
        )
    )
    return result


def dbQueryFeedbackWithScore():
    result = botscore_connection.execute(
        sqlalchemy.text(
            """
            SELECT target_screen_name, feedback_label, feedback_text, feedback.time_stamp, feedbackscore.bot_score_english, feedbackscore.bot_score_universal, feedbackscore.time_stamp FROM feedback
            LEFT JOIN
            (SELECT DISTINCT ON (user_id) id, user_id, screen_name, bot_score_english, bot_score_universal, botscore.time_stamp
            FROM botscore
            WHERE user_id IN (SELECT target_user_id FROM feedback)
            ORDER BY user_id, botscore.time_stamp DESC) AS feedbackscore
            ON target_user_id = user_id;
            """
        )
    )
    return result


def dbIncreaseNumRequest(id):
    botscore_connection.execute(
        sqlalchemy.text(
            """
            UPDATE botscore
            SET num_requests = num_requests + 1
            WHERE id = :id
            """
        ),
        {"id": id}
    )


def dbIncreaseNumRequests(id_list):
    botscore_connection.execute(
        sqlalchemy.text(
            """
            UPDATE botscore
            SET num_requests = num_requests + 1
            WHERE id in :ids
            """
        ),
        {"ids": tuple(id_list)}
    )


def dbInsertFeedback(feedback):
    result = botscore_connection.execute(
        sqlalchemy.text(
            """
            INSERT INTO public.feedback(source_user_id, target_user_id, target_screen_name, time_stamp, feedback_label,
                feedback_text, target_profile, target_timeline_tweets, target_mention_tweets)
            VALUES (:source_user_id, :target_user_id, :target_screen_name, :time_stamp, :feedback_label,
                :feedback_text, :target_profile, :target_timeline_tweets, :target_mention_tweets)
            """
        ),
        feedback
    )
    return result


def getUserRecordStatus(user_entry, tweets_per_day, num_requests, config_file):
    if user_entry["timestamp"]:
        timedelta_age = datetime.now() - user_entry["timestamp"].replace(tzinfo=None)
        age_of_user = timedelta_age.total_seconds()

        if age_of_user < int(config_file.get("FlowChart", "age_min")):
            return True
        elif age_of_user > int(config_file.get("FlowChart", "age_max")):
            return False
        else:
            if tweets_per_day:
                expected_tweets = age_of_user * tweets_per_day / 86400.
                if expected_tweets > int(config_file.get("FlowChart", "expected_tweets_max"))\
                        or num_requests > int(config_file.get("FlowChart", "reqs_max")):
                    return False
                else:
                    return True
            else:
                return False
    else:
        return None


@api.template_filter('strftime')
def _jinja2_filter_datetime(date, fmt=None):
    if date:
        return date.strftime("%y-%m-%d %H:%M")
    else:
        return None


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
    if request.headers.get("origin") != "http://iuni.iu.edu":
        return jsonify({'success': False}), 405

    print("Start to processing ...")
    t1 = time.time()
    # get the query string according to different HTTP methods
    if request.method == "GET":
        user_ids_query = request.args.get("user_id")
        user_names_query = request.args.get("screen_name")
        if (not user_ids_query) and (not user_names_query):
            return jsonify({'success': False}), 400
    elif request.method == "POST":
        query_file = request.get_json()
        user_ids_query = query_file.get("user_id")
        user_names_query = query_file.get("screen_name")
        if (not user_ids_query) and (not user_names_query):
            return jsonify({'success': False}), 400
    else:
        return jsonify({'success': False}), 405

    # load the config file
    config_file = configparser.ConfigParser()
    config_file.read("./config.cfg")

    # parse the query according to the type
    db_results = []
    total_request_number = 0
    if user_ids_query:
        if isinstance(user_ids_query, list):
            user_ids = list(map(int, user_ids_query))
        elif isinstance(user_ids_query, str):
            user_ids = list(map(int, user_ids_query.split(",")))
        total_request_number += len(user_ids)
        db_results += dbQueryUserIDIn(user_ids)

    t2 = time.time()
    print("Done parsing the query, start to SQL, %.4f" % (t2-t1))
    if user_names_query:
        if isinstance(user_names_query, list):
            user_names = user_names_query
        elif isinstance(user_names_query, str):
            user_names = user_names_query.split(",")
        db_results += dbQueryUserScreenNameIn(user_names)
        total_request_number += len(user_names)

    t3 = time.time()
    print("Done SQL, start to return, %.4f" % (t3-t2))

    user_scores = []
    user_to_update = []

    for row in db_results:
        all_bot_scores = row[3] if row[3] else dict()
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
                "id": str(row[1]) if row[1] else None
            },
            "scores": {
                "english": row[4],
                "universal": row[5]
            },
            "timestamp": row[6]
        }

        user_tweet_per_day = row[7]
        num_requests = row[9]
        user_record["fresh"] = getUserRecordStatus(
            user_record, user_tweet_per_day, num_requests, config_file
        )
        user_scores.append(user_record)
        user_to_update.append(row[0])

    hits = len(db_results)
    response = {
        "statuses": {
            "hit": hits,
            "miss": total_request_number - hits
        },
        "result": user_scores
    }

    t4 = time.time()
    print("Done return, %.4f" % (t4-t3))

    dbIncreaseNumRequests(user_to_update)

    t5 = time.time()

    print("Done increase, %.4f" % (t5-t4))

    return jsonify(response)


@api.route("/api/feedback", methods=["POST"])
def insertFeedback():
    """
    The feedback insertion endpoint.
    """
    if request.headers.get("origin") != "http://iuni.iu.edu":
        return jsonify({'success': False}), 405

    if request.method == "POST":
        try:
            feedback = request.get_json()

            dbInsertFeedback(feedback)
            # process the feedback
            return jsonify({'success': True}), 201
        except Exception as e:
            print(e)
            return jsonify({'success': False}), 400

    return jsonify({'success': False}), 405


@api.route("/api/showfeedback", methods=["GET"])
@basic_auth.required
def showFeedback():
    if request.method != "GET":
        return jsonify({'success': False}), 405

    feedbacks = []
    labels = []
    db_results = dbQueryFeedback()
    for db_result in db_results:
        labels.append(db_result[2])
        if db_result[2] != "block" and db_result[2] != "unfollow":
            feedbacks.append(db_result)

    return render_template(
        "showfeedback.html",
        feedbacks=feedbacks,
        total_num = len(labels),
        label_counter = Counter(labels)
    )


@api.route("/api/showfeedbackwithscore", methods=["GET"])
@basic_auth.required
def showFeedbackwithScore():
    if request.method != "GET":
        return jsonify({'success': False}), 405

    feedbacks = []
    labels = []
    db_results = dbQueryFeedbackWithScore()
    for db_result in db_results:
        labels.append(db_result[1])
        if db_result[1] != "block" and db_result[1] != "unfollow":
            feedbacks.append(db_result)

    return render_template(
        "showfeedbackwithscore.html",
        feedbacks=feedbacks,
        total_num = len(labels),
        label_counter = Counter(labels)
    )


if __name__ == "__main__":
    api.run(debug=True, port=6060)
