/*
Script: Validation script for post-insertion of botometer feedback logs into the botometer database (to be executed against the feedback table of the botometer database)
Author: Mihai Avram
E-mail: mihai.v.avram@gmail.com
*/

--TODO BEFORE EXECUTING SCRIPT: REPLACE ALL <BEGINNING TIMESTAMP OF LOGS INSERTED> AND <ENDING TIMESTAMP OF LOGS INSERTED> TEXT WITH THE ACTUAL TIMESTAMP IN SECONDS (if this timestamp is more than 13 digits long, then it is in milliseconds, so one must divide by 1000 by placing it in the query

--target_user_id check
DO $$
BEGIN
IF (SELECT COUNT(*) FROM feedback WHERE target_user_id IS NULL OR target_user_id<0) > 0
THEN
	RAISE NOTICE 'FAIL: There were some null or negative target_user_ids';
ELSE
	RAISE NOTICE 'SUCCESS: All target_user_ids were present and non-negative';
END IF;	

--time_stamp checks
IF (SELECT COUNT(*) FROM feedback WHERE time_stamp BETWEEN (SELECT to_timestamp(<BEGINNING TIMESTAMP OF LOGS INSERTED>)) and (SELECT to_timestamp(<ENDING TIMESTAMP OF LOGS INSERTED>))) = (SELECT COUNT(*) FROM feedback)
THEN
	RAISE NOTICE 'SUCCESS: All timestamps have been inserted in the correct location';
ELSE
	RAISE NOTICE 'FAIL: Some timestamped records have been misplaced';
END IF;

--feedback_label checks
IF (SELECT COUNT(*) FROM feedback WHERE feedback_label IS NULL OR feedback_label='') > 0
THEN
	RAISE NOTICE 'FAIL: Some feedback_labels are null or blank, which need to be filled in';
ELSE
	RAISE NOTICE 'SUCCESS: All feedback_labels are filled in with some text';
END IF;

--feedback_text checks
IF (SELECT COUNT(*) FROM feedback WHERE feedback_text IS NULL OR feedback_text='') > 0
THEN
	RAISE NOTICE 'FAIL: Some feedback_texts are null or blank, which need to be filled in';
ELSE
	RAISE NOTICE 'SUCCESS: All feedback_texts are filled in with some text';
END IF;

END
$$
