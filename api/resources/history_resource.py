from flask_restx import Namespace, Resource, fields
from models.history import History
from extensions import db
from resources import parser, getTimeWindow

api = Namespace('history', description='Access listening history')

history_fields = api.model('Play', {
    'played_at': fields.DateTime(readOnly=True, description='Time that a track was played at'),
    'name': fields.String(attribute='track.name', description='Name of track played'),
    'album': fields.String(attribute='track.album', description='Album of track played'),
    'artist': fields.String(attribute='track.artist', description='Artist of track played')
})

@api.route('/')
class HistoryList(Resource):
    @api.marshal_list_with(history_fields)
    def get(self):
        args = parser.parse_args()
        start, end = getTimeWindow(args)
        limit = args['limit'] if args['limit'] else 100
        return History.query.filter(db.func.date(History.played_at) > start, db.func.date(History.played_at) < end).order_by(History.played_at.desc()).limit(limit).all()
