UPDATE botscore SET screen_name = REPLACE (screen_name, '@', '') WHERE screen_name IN 
(SELECT screen_name FROM botscore WHERE screen_name LIKE '@%');