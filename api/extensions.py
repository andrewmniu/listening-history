from flask_sqlalchemy import SQLAlchemy
from flask_restx import Api

db = SQLAlchemy()
description = '''
This API accesses data on my personal listening history stored in a MySQL database. The history and tracks endpoints are the only ones that also have post requests, since those are the only tables in the relational database. The other endpoints are different queries to get more advanced information about my listening history.
'''
api = Api(version="1.0", title="Spotify Listening History API", description=description)
