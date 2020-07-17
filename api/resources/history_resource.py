from flask_restx import Namespace, Resource, fields
from models.history import History
from models.track import Track
from extensions import db
from resources import parser, getTimeWindow

api = Namespace('history', description='Access listening history')

track_fields = api.model('Track', {
    'id': fields.String(description='Spotify Track id'),
    'name': fields.String(description='Name of track played'),
    'album': fields.String(description='Album of track played'),
    'artist': fields.String(description='Artist of track played')
})

play_fields = api.model('Play', {
    'played_at': fields.DateTime(readOnly=True, description='Time that a track was played at'),
    'track': fields.Nested(track_fields)
})

history_fields = api.model('History', {
    'page': fields.Integer(description='Page of results'),
    'pages': fields.Integer(description='Total number of pages of results'),
    'history': fields.List(fields.Nested(play_fields))
})

@api.route('/')
@api.param('per_page', type=int, description='number of tracks on each page')
@api.param('page', type=int, description='page of tracks to return')
class HistoryList(Resource):
    @api.marshal_list_with(history_fields)
    def get(self):
        args = parser.parse_args()
        start, end = getTimeWindow(args)
        limit = args['limit'] if args['limit'] else 100
        query = db.session.query(History.played_at, Track)\
            .join(Track, History.track_id == Track.id, isouter=True)\
            .filter(db.func.date(History.played_at) > start, db.func.date(History.played_at) < end)\
            .order_by(db.desc(History.played_at)).paginate(page=args['page'], per_page=args['per_page'])
        # print(query.page)
        # print(query.pages)
        history_list = [{'played_at': played_at, 'track': track} for played_at, track in query.items]
        payload = {'page': query.page, 'pages': query.pages, 'history': history_list}
        return payload
