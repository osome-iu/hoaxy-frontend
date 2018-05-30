-- Table: public.feedback

-- DROP TABLE public.feedback;
CREATE TABLE public.feedback
(
  id SERIAL PRIMARY KEY NOT NULL,
  source_user_id bigint,
  target_user_id bigint NOT NULL,
  target_screen_name character varying(15),
  target_reported_botscores jsonb,
  time_stamp timestamp with time zone DEFAULT now(),
  feedback_label character varying(20),
  feedback_text text,
  target_profile jsonb,
  target_timeline_tweets jsonb,
  target_mention_tweets jsonb
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.botscore
  OWNER TO botometer;
