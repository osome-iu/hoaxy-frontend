-- Table: public.botscore

-- DROP TABLE public.botscore;
CREATE TABLE public.botscore
(
  id SERIAL PRIMARY KEY NOT NULL,
  user_id bigint NOT NULL,
  screen_name character varying(15),
  time_stamp timestamp with time zone DEFAULT now(),
  all_bot_scores jsonb,
  bot_score_english real,
  bot_score_universal real,
  requester_ip text,
  tweets_per_day real,
  num_tweets integer,
  num_mentions integer,
  latest_tweet_timestamp timestamp with time zone,
  num_requests integer,
  user_profile jsonb
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.botscore
  OWNER TO postgres;
-- Index: public.botscore_ix_botscoreenglish

-- DROP INDEX public.botscore_ix_botscoreenglish;

CREATE INDEX botscore_ix_botscoreenglish
  ON public.botscore
  USING btree
  (bot_score_english);

-- Index: public.botscore_ix_botscoreuniversal

-- DROP INDEX public.botscore_ix_botscoreuniversal;

CREATE INDEX botscore_ix_botscoreuniversal
  ON public.botscore
  USING btree
  (bot_score_universal);

-- Index: public.botscore_ix_requesterip

-- DROP INDEX public.botscore_ix_requesterip;

CREATE INDEX botscore_ix_requesterip
  ON public.botscore
  USING btree
  (requester_ip COLLATE pg_catalog."default");

-- Index: public.botscore_ix_userid_timestamp

-- DROP INDEX public.botscore_ix_userid_timestamp;

CREATE INDEX botscore_ix_userid_timestamp
  ON public.botscore
  USING btree
  (user_id, time_stamp);

