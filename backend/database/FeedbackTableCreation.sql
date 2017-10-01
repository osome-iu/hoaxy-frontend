-- Table: public.feedback

-- DROP TABLE public.feedback;
CREATE TABLE public.feedback
(
  id SERIAL PRIMARY KEY NOT NULL,
  user_id bigint NOT NULL,
  screen_name character varying(15),
  time_stamp timestamp with time zone DEFAULT now(),
  feedback_label character varying(50),
  feedback_text text,
  profile jsonb,
  timeline_tweets jsonb,
  mention_tweets jsonb
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.botscore
  OWNER TO postgres;
