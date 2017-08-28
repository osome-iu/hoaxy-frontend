# -*- coding: utf8 -*-
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import REAL, TEXT

api = Flask(__name__)
api.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://localhost/botbase"
db = SQLAlchemy(api)

class Botbase(db.Model):
    """
    Objective Model for the botscore table in database
    """
    __tablename__ = "botscore"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.BigInteger)
    screen_name = db.Column(db.String(15))
    time_stamp = db.Column(db.TIMESTAMP)
    all_bot_scores = db.Column(JSONB)
    bot_score_english = db.Column(REAL)
    bot_score_universal = db.Column(REAL)
    requester_ip = db.Column(TEXT)
    tweets_per_day = db.Column(REAL)
    num_tweets = db.Column(db.Integer)
    num_mentions = db.Column(db.Integer)
    latest_tweet_timestamp = db.Column(db.TIMESTAMP)
    num_requests = db.Column(db.Integer)
    user_profile = db.Column(JSONB)


    def getJsonRepr(self):
        return {
            "user_id": self.user_id,
            "screen_name": self.screen_name,
            "time_stamp": self.time_stamp,
            "all_bot_scores": self.all_bot_scores,
            "bot_score_english": self.bot_score_english,
            "bot_score_universal": self.bot_score_universal,
            "requester_ip": self.requester_ip,
            "tweets_per_day": self.tweets_per_day,
            "num_tweets": self.num_tweets,
            "num_mentions": self.num_mentions,
            "latest_tweet_timestamp": self.latest_tweet_timestamp,
            "num_requests": self.num_requests,
            "user_profile": self.user_profile
        }

    def __repr__(self):
        return "User: %s, ID: %d" % (self.screen_name, self.user_id)
