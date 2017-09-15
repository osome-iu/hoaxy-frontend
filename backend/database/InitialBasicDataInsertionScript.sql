/*botscore table rudimentary data insertion script*/
INSERT INTO botscore (user_id, screen_name, all_bot_scores, bot_score_english, bot_score_universal, requester_ip, tweets_per_day, num_tweets, num_mentions, latest_tweet_timestamp, num_requests, user_profile) 
VALUES (12345, 
		'jondoe', 
		'{"friend_classification": 0.33, "content_classification": 0.31, "user_classification": 0.36, "sentiment_classification": 0.03, "languageagnostic_classification": 0.34, "temporal_classification": 0.3, "network_classification": 0.1}',
		0.55,
		0.34,
		'["234.122.142.48"]',
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
		'{"friend_classification": 0.21, "content_classification": 0.32, "user_classification": 0.02, "sentiment_classification": 0.17, "languageagnostic_classification": 0.1, "temporal_classification": 0.18, "network_classification": 0.09}',
		0.22,
		0.1,
		'["111.140.111.48"]',
		15.76,
		1700,
		305,
		'2017-08-28 15:12:23',
		2,
		'{ "name": "rain", "age": "21", "political_view": "republican"}'
);


INSERT INTO botscore (user_id, screen_name, time_stamp, all_bot_scores, bot_score_english, bot_score_universal, requester_ip, tweets_per_day, num_tweets, num_mentions, latest_tweet_timestamp, num_requests, user_profile) 
VALUES (917736974, 
		'CCLiteracyNews', 
		to_timestamp(1503806457),
		'{"friend_classification": 0.46, "content_classification": 0.35, "user_classification": 0.24, "sentiment_classification": 0.47, "languageagnostic_classification": 0.32, "temporal_classification": 0.52, "network_classification": 0.42}',
		0.39,
		0.32,
		'["150.140.142.48"]',
		NULL,
		179,
		NULL,
		NULL,
		1,
		NULL
);

INSERT INTO botscore (user_id, screen_name, time_stamp, all_bot_scores, bot_score_english, bot_score_universal, requester_ip, tweets_per_day, num_tweets, num_mentions, latest_tweet_timestamp, num_requests, user_profile) 
VALUES (428845131, 
		'awesomely_hk', 
		to_timestamp(1435698355),
		'{"friend_classification": 0.1, "content_classification": 0.23, "user_classification": 0.18, "sentiment_classification": 0.46, "temporal_classification": 0.16, "network_classification": 0.09}',
		0.21,
		NULL,
		'["172.29.33.45", "137.132.3.8"]',
		NULL,
		200,
		NULL,
		NULL,
		1,
		NULL
);



