/*
Script: Validation script for post-insertion of bot-score logs into the botometer database (to be executed against the botscore table of the botometer database)
Author: Mihai Avram
E-mail: mihai.v.avram@gmail.com
*/

--user_id checks
DO $$
BEGIN
IF (SELECT COUNT(*) FROM botscore WHERE user_id<0) = 0
THEN
	RAISE NOTICE 'SUCCESS: No non-negative user_ids';
ELSE
	RAISE NOTICE 'FAIL: There were some negative user_ids';
END IF;	

--time_stamp checks
IF (select count(*) from botscore where time_stamp between (SELECT MIN(time_stamp) FROM botscore) and (SELECT MAX(time_stamp) FROM botscore)) = (SELECT COUNT(*) FROM botscore)
THEN
	RAISE NOTICE 'SUCCESS: All timestamps have been inserted in the correct location';
ELSE
	RAISE NOTICE 'FAIL: Some timestamped records have been misplaced';
END IF;	

--all_bot_scores checks
IF (SELECT COUNT(*) FROM botscore WHERE all_bot_scores=NULL) = 0
THEN
	RAISE NOTICE 'SUCCESS: No null all_bot_score json';
ELSE
	RAISE NOTICE 'FAIL: There were some null all_bot_score json';
END IF;	

IF (SELECT COUNT(*) FROM botscore botscore WHERE (all_bot_scores#>>'{}') ~* '\{\"user\"\s*:\s*.*,\s*\"friend\"\s*:\s*.*,\s*\"content\"\s*:\s*.*,\s*\"network\"\s*:\s*.*,\s*\"temporal\"\s*:\s*.*,\s*\"sentiment\"\s*:\s*.*}') = (SELECT COUNT(*) FROM botscore)
THEN
	RAISE NOTICE 'SUCCESS: All all_bot_score json format and input is the same';
ELSE
	RAISE NOTICE 'FAIL: There are some discrepancies and inconsistencies in the all_bot_score json';
END IF;	

--bot_score_english checks
IF (SELECT COUNT(*) FROM botscore WHERE bot_score_english<0 OR bot_score_english>1 OR bot_score_english=NULL) = 0
THEN
	RAISE NOTICE 'SUCCESS: All english botscores are proper, non-null botscores';
ELSE
	RAISE NOTICE 'FAIL: There are some inconsistent english botscores which are <0 or >1 or null';
END IF;	


--bot_score_universal checks
IF (SELECT COUNT(*) FROM botscore WHERE bot_score_universal IS NOT NULL AND (bot_score_english<0 OR bot_score_english>1)) = 0
THEN
	RAISE NOTICE 'SUCCESS: All universal botscores are proper botscores';
ELSE
	RAISE NOTICE 'FAIL: There are some inconsistent universal botscores which are <0 or >1';
END IF;	

--requester_ip checks
IF (SELECT COUNT(*) FROM botscore WHERE requester_ip IS NOT NULL OR requester_ip NOT LIKE '[%]') = (SELECT COUNT(*) FROM botscore)
THEN
	RAISE NOTICE 'SUCCESS: Requester_ip seems non-null and has proper format';
ELSE
	RAISE NOTICE 'FAIL: There are some null requester_ips or improper ones';
END IF;	

IF (SELECT COUNT(*) FROM botscore WHERE requester_ip ~* '(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(,\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})*') = (SELECT COUNT(*) FROM botscore)
THEN
	RAISE NOTICE 'SUCCESS: Requester_ip has the correct matching characteristics i.e. ipnum,ipnum etc..';
ELSE
	RAISE NOTICE 'FAIL: Some requester_ips are incorrect either due to insertion problems or presentation';
END IF;	


--tweets_per_day checks
IF (SELECT COUNT(*) FROM botscore WHERE tweets_per_day IS NOT NULL) = 0
THEN
	RAISE NOTICE 'SUCCESS: all tweets_per_day are null';
ELSE
	RAISE NOTICE 'FAIL: There are some non-null tweets_per_day';
END IF;	


--num_submitted_timeline_tweets checks
IF (SELECT COUNT(*) FROM botscore WHERE num_submitted_timeline_tweets IS NOT NULL) = 0
THEN
	RAISE NOTICE 'SUCCESS: all num_submitted_timeline_tweets are null';
ELSE
	RAISE NOTICE 'FAIL: There are some non-null num_submitted_timeline_tweets';
END IF;	


--num_submitted_mention_tweets checks
IF (SELECT COUNT(*) FROM botscore WHERE num_submitted_mention_tweets IS NOT NULL) = 0
THEN
	RAISE NOTICE 'SUCCESS: all num_submitted_mention_tweets are null';
ELSE
	RAISE NOTICE 'FAIL: There are some non-null num_submitted_mention_tweets';
END IF;	


--num_requests checks
IF (SELECT COUNT(*) FROM botscore WHERE num_requests=0) = (SELECT COUNT(*) FROM botscore)
THEN
	RAISE NOTICE 'SUCCESS: All inserted num_requests are 0';
ELSE
	RAISE NOTICE 'FAIL: There are some non-zero inserted num_requests';
END IF;	

END
$$
