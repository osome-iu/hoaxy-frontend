# -*- coding: utf8 -*-
from dbmodels import api, Botbase
from flask import jsonify
#from flask.ext.sqlalchemy import SQLAlchemy

@api.route("/")
def hello():
    return "Hello World!"

@api.route("/userids/<int:user_id>", methods=["GET"])
def findUser(user_id):
    query_resutls = Botbase.query.filter(Botbase.user_id==user_id).all()
    if query_resutls:
        return jsonify(query_resutls[0].getJsonRepr())
    else:
        return jsonify({})

if __name__ == "__main__":
    #pass
    api.run()
    #bot = Botbase.query.filter(Botbase.user_id==12345).all()
    #print type(getUser(12345).user_id)
    #print getUser(12345).user_id
