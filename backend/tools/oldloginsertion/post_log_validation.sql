select * from botscore order by id limit 5;
--to be able to view the schema/entries of a few records

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

select date_trunc('day', time_stamp) as "day", count(*) id from botscore group by 1 order by 1;
--The counts in the id column should be increasing (not necessarily monotonically) but increasing nonetheless 

select requester_ip from botscore where requester_ip like '[%]';
--ensure no bracketed list ips were inserted, instead they should all be comma delimited with no list wrapper (should returne empty)

select user_id from botscore where user_id < 0;
--ensure no negative user_ids are present (should not return any records)
