# Old Logs To Botscore Table Mapping
BotscoreTableFields | LogRetrievalValue
--- | ---
id | AUTO-INCREMENT
user_id | json:search/user_id
screen_name | json:search/sn
time_stamp | json:timestamp
all_bot_scores | json:categories
bot_score_english | json:score/english, or json:score, or json:classification
bot_score_universal | json:score/universal, or json:categories/languageagnostic_classification, or NULL
requester_ip | json:remote_ip
tweets_per_day | NULL
num_tweets | json:num_tweets
num_mentions | NULL
latest_tweet_timestamp | NULL
num_requests | previous+1 where previous = (num_requests of user_id most recent timestamp)
user_profile | NULL
