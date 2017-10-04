-- Database: botbase

-- DROP DATABASE botbase;

CREATE DATABASE botbase
  WITH OWNER = botometer
       ENCODING = 'UTF8'
       TABLESPACE = pg_default
       LC_COLLATE = 'en_US.UTF-8'
       LC_CTYPE = 'en_US.UTF-8'
       CONNECTION LIMIT = -1;

ALTER DATABASE botbase
  SET TimeZone = 'UTC';

