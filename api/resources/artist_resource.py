from flask_restx import Namespace, Resource, fields, reqparse, inputs
from models.history import History
from models.track import Track
from extensions import db
from resources.activity_resource import day_fields

api = Namespace('artists', description='Access artist listening trends')

parser = reqparse.RequestParser()
parser.add_argument('desc', type=inputs.boolean, default=True, location='args')
parser.add_argument('artists', action='split', location='args')

artist_fields = api.model('Artists', {
    'artist': fields.String(description='Spotify Track id'),
    'artist_history': fields.List(fields.Nested(day_fields))
})

@api.route('/by-artist')
class ByArtist(Resource):
    @api.marshal_list_with(artist_fields)
    def get(self):
        args = parser.parse_args()
        order = db.desc(db.func.date(History.played_at)) if args['desc'] else db.func.date(History.played_at)
        print(args['artists'])
        if not args['artists']:
            return []

        query = db.session.query(Track.artist, db.func.date(History.played_at), db.func.count(History.track_id))\
            .join(Track, History.track_id == Track.id, isouter=True)\
            .filter(Track.artist.in_(args['artists']))\
            .group_by(Track.artist, db.func.date(History.played_at))\
            .order_by(Track.artist, order).all()

        payload = []
        current_artist = ''
        for artist, date, plays in query:
            if artist == current_artist:
                payload[-1]['artist_history'].append({'date': date, 'plays': plays})
            else:
                current_artist = artist
                payload.append({'artist': artist, 'artist_history': [{'date': date, 'plays': plays}]})

        return payload
