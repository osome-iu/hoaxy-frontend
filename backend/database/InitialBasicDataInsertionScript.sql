/*botscore table rudimentary data insertion script*/
INSERT INTO botscore (user_id, screen_name, all_bot_scores, bot_score_english, bot_score_universal, requester_ip, tweets_per_day, num_tweets, num_mentions, latest_tweet_timestamp, num_requests, user_profile) 
VALUES (12345, 
		'jondoe', 
		'{ "bot_score_english": "0.55", "bot_score_universal": "0.54", "some_other_bot_score": "0.22"}',
		0.55,
		0.54,
		'2001:0db8:0100:f101:0210:a4ff:fee3:9566',
		22.34,
		2000,
		123,
		'2017-08-24 10:23:54',
		4,
		'{ "name": "john", "age": "44", "political_view": "democrat"}'
);

INSERT INTO botscore (user_id, screen_name, all_bot_scores, bot_score_english, bot_score_universal, requester_ip, tweets_per_day, num_tweets, num_mentions, latest_tweet_timestamp, num_requests, user_profile) 
VALUES (24456, 
		'rainman', 
		'{ "bot_score_english": "0.22", "bot_score_universal": "0.23", "some_other_bot_score": "0.11"}',
		0.22,
		0.23,
		'1100:0cb8:0100:f101:0210:a4ff:fee3:9576',
		15.76,
		1700,
		305,
		'2017-08-28 15:12:23',
		2,
		'{ "name": "rain", "age": "21", "political_view": "republican"}'
);


