select * from botscore order by id limit 5;
--to be able to view the schema/entries of a few records

select * from botscore where all_bot_scores=NULL;
--if there are any null records here, must check why they are null, though there should not be too many null entries

--NUM RECORDS QUERY
select count(*) from botscore;
--save this number for the TIMESTAMP BETWEEN QUERY below, should be the same number

select bot_score_english from botscore where bot_score_english=NULL;
--should not return any records

select bot_score_english from botscore where bot_score_english < 0;
--should not return any records

select avg(bot_score_english) from botscore;
--should return a number between 0 and 1

select bot_score_universal from botscore where bot_score_universal < 0;
--should not return any records

select avg(bot_score_universal) from botscore;
--should return a number between 0 and 1

select sum(num_tweets) from botscore;
--should return a valid positive number

select min(time_stamp) from botscore;
--insert the result in the leftmost date of the TIMESTAMP BETWEEN QUERY

select max(time_stamp) from botscore;
--insert the result in the rightmost date of the TIMESTAMP BETWEEN QUERY

--TIMESTAMP BETWEEN QUERY
select count(*) from botscore where time_stamp between '2015-06-30 21:10:05+00' and '2017-03-16 00:17:17+00';
--should reflect the count(*) from first query

select requester_ip from botscore where requester_ip like '[%]';
--ensure no bracketed list ips were inserted, instead they should all be comma delimited with no list wrapper (should returne empty)

select user_id from botscore where user_id < 0;
--ensure no negative user_ids are present (should not return any records)

select count(*) from botscore where num_requests=0;
--should return the same as NUM RECORDS query above

select count(*) from botscore botscore where (all_bot_scores#>>'{}') ~* '\{\"user\"\s*:\s*.*,\s*\"friend\"\s*:\s*.*,\s*\"content\"\s*:\s*.*,\s*\"network\"\s*:\s*.*,\s*\"temporal\"\s*:\s*.*,\s*\"sentiment\"\s*:\s*.*}';
--should return the same as NUM RECORDS query above and if not, run the following query and see why

select (all_bot_scores#>>'{}') as botscorestext from botscore where (all_bot_scores#>>'{}') !~* '\{\"user\"\s*:\s*.*,\s*\"friend\"\s*:\s*.*,\s*\"content\"\s*:\s*.*,\s*\"network\"\s*:\s*.*,\s*\"temporal\"\s*:\s*.*,\s*\"sentiment\"\s*:\s*.*}';
