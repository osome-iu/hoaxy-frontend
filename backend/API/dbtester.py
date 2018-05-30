# -*- coding: utf8 -*-
#from dbmodels import db, BotbaseModel
#from collections import Counter
import sqlalchemy


if __name__ == "__main__":
    botscore_engine = sqlalchemy.create_engine("postgresql://localhost/botbase")
    botscore_connection = botscore_engine.connect()
    #user_id = 884486040156766209
    result = botscore_connection.execute(
        sqlalchemy.text(
        """
        SELECT uid AS user_id, sname AS screen_name, all_bot_scores FROM
        (SELECT NULL AS uid, names.screen_name AS sname FROM UNNEST(:screen_names) AS names(screen_name)
        UNION
        SELECT ids.user_id AS uid, NULL AS sname FROM UNNEST(:user_ids) AS ids(user_id)) AS temptable
        LEFT JOIN botscore ON temptable.uid = botscore.user_id OR temptable.sname = botscore.screen_name
        """),
        {
            "screen_names": ['severequeerfear','tylerthompson17','ChaoCacaoTour','johndoe'],
            "user_ids": [18949751,335321861,18953498,12347]
        }
    )
    for row in result:
        print(row)


SELECT user_id, names.screen_name, all_bot_scores
FROM botscore
RIGHT JOIN UNNEST(ARRAY['severequeerfear','tylerthompson17','ChaoCacaoTour','johndoe']) AS names(screen_name)
ON botscore.screen_name = names.screen_name
