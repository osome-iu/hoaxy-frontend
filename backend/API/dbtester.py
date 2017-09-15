# -*- coding: utf8 -*-
from dbmodels import db, BotbaseModel
from collections import Counter

if __name__ == "__main__":
    user_id = 884486040156766209
    #user_enties = db.session.query(BotbaseModel.user_id).all()
    ##print(type(user_enties[0][0]))
    #user_ids = list(map(lambda x:x[0], user_enties))
    ##print(len(user_ids))
    ##print(len(set(user_ids)))
    #id_counter = Counter(user_ids)
    #for key, value in id_counter.items():
        #if value > 2:
            #print("%d: %d" % (key, value))
    entries = BotbaseModel.query.filter(BotbaseModel.user_id == user_id).\
        order_by(BotbaseModel.time_stamp).all()
    for entry in entries:
        print(entry.time_stamp)
    #print(entries[-1].time_stamp)
