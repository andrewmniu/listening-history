from flask_restx import Namespace, Resource, fields, reqparse, inputs
from models.history import History
from models.track import Track
from extensions import db
from resources.activity_resource import week_fields
from datetime import datetime, timedelta, date


api = Namespace('artists', description='Access artist listening trends')

parser = reqparse.RequestParser()
parser.add_argument('artists', action='split', location='args')

artist_fields = api.model('Artists', {
    'artist': fields.String(description='Spotify Track id'),
    'artist_history': fields.List(fields.Nested(week_fields))
})

@api.route('/by-artist')
class ByArtist(Resource):
    @api.marshal_list_with(artist_fields)
    def get(self):
        args = parser.parse_args()
        if not args['artists']:
            return []

        query = db.session.query(Track.artist, db.func.date(History.played_at), db.func.count(History.track_id))\
            .join(Track, History.track_id == Track.id, isouter=True)\
            .filter(Track.artist.in_(args['artists']))\
            .group_by(Track.artist, db.func.yearweek(History.played_at))\
            .order_by(Track.artist, db.func.date(History.played_at)).all()

        return self.getPayload(query)

    @staticmethod
    def impute(payload, week_idx, end, weeks):
        while week_idx < end:
            payload[-1]['artist_history'].append({'week': weeks[week_idx], 'plays': 0})
            week_idx += 1
        return week_idx

    @staticmethod
    def getPayload(query):
        epoch = date(2019,6,9)
        weeks = [epoch + timedelta(i) for i in range (0, (date.today() - epoch).days, 7)]

        payload = []
        current_artist = ''
        week_idx = 0
        for artist, week, plays in query:
            week = week - timedelta(days=week.weekday()-6) if week.weekday() == 6 else week - timedelta(days=week.weekday()+1)

            if artist == current_artist:
                diff = (week - epoch).days // 7

                week_idx = ByArtist.impute(payload, week_idx, diff, weeks)

                payload[-1]['artist_history'].append({'week': week, 'plays': plays})
                week_idx += 1
            else:
                if len(payload) > 0:
                    week_idx = ByArtist.impute(payload, week_idx, len(weeks), weeks)
                current_artist = artist
                week_idx = 0

                diff = (week - epoch).days // 7
                payload.append({'artist': artist, 'artist_history': []})
                week_idx = ByArtist.impute(payload, week_idx, diff, weeks)
                payload[-1]['artist_history'].append({'week': week, 'plays': plays})
                week_idx += 1

        if len(payload) > 0:
            week_idx = ByArtist.impute(payload, week_idx, len(weeks), weeks)
        return payload
