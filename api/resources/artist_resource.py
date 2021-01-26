from flask_restx import Namespace, Resource, fields, reqparse, inputs
from models.history import History
from models.track import Track
from extensions import db
from resources.activity_resource import week_fields
from datetime import datetime, timedelta, date


api = Namespace('artist-trends', description='Access artist listening trends')


parser = reqparse.RequestParser()
parser.add_argument('artists', action='split', location='args')

artist_trend_fields = api.model('Artist Trends', {
    'name': fields.String(description='Artist name'),
    'activity': fields.List(fields.Nested(week_fields), description='List of weeks and number of tracks played by the artist')
})

@api.route('/trends')
@api.param('artists', description='comma separated list of artist names')
class ArtistTrends(Resource):
    @api.marshal_list_with(artist_trend_fields)
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
            payload[-1]['activity'].append({'week': weeks[week_idx], 'plays': 0})
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

                week_idx = ArtistTrends.impute(payload, week_idx, diff, weeks)

                payload[-1]['activity'].append({'week': week, 'plays': plays})
                week_idx += 1
            else:
                if len(payload) > 0:
                    week_idx = ArtistTrends.impute(payload, week_idx, len(weeks), weeks)
                current_artist = artist
                week_idx = 0

                diff = (week - epoch).days // 7
                payload.append({'name': artist, 'activity': []})
                week_idx = ArtistTrends.impute(payload, week_idx, diff, weeks)
                payload[-1]['activity'].append({'week': week, 'plays': plays})
                week_idx += 1

        if len(payload) > 0:
            week_idx = ArtistTrends.impute(payload, week_idx, len(weeks), weeks)
        return payload

trending_artist_list_fields = api.model('Trending Artists', {
    'trending': fields.List(fields.String(description='Any artist that was top 3 for any given month')),
    'hidden': fields.List(fields.String(description='Artists to hide on graph on front end'))
})

@api.route('/artists')
class TrendingArtists(Resource):
    @api.marshal_with(trending_artist_list_fields)
    def get(self):
        query = db.session.query(db.func.month(History.played_at),Track.artist,  db.func.count(History.track_id))\
            .join(Track, History.track_id == Track.id, isouter=True)\
            .group_by(db.func.year(History.played_at), db.func.month(History.played_at), Track.artist)\
            .having(db.func.count(History.track_id) > 30)\
            .order_by(db.desc(db.func.year(History.played_at)), db.desc(db.func.month(History.played_at)), db.desc(db.func.count(History.track_id))).all()

        current = ''
        count = 0
        trending = set()
        recent = set()
        for item in query:
            if current == item[0]:
                if count < 3:
                    trending.add(item[1])
                count+=1
            else:
                current = item[0]
                trending.add(item[1])
                count = 1
                if len(recent) < 4:
                    print(item)
                    recent.add(item[1])

        return {"trending": trending, "hidden": trending.difference(recent)}
