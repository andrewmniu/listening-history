from flask_restx import Namespace, Resource, fields
from models.history import History
from models.track import Track
from extensions import db
from resources import parser, getTimeWindow
from resources.history_resource import track_fields

api = Namespace('favorites', description = 'Access favorite items')

@api.param('end', description='end date (exclusive): YYYY-MM-DD')
@api.param('start', description='start date (inclusive): YYYY-MM-DD')
class ParamDocumenter():
    pass

track_fields = api.model('Favorite Track', {
    'track': fields.Nested(track_fields),
    'times_played': fields.Integer(description='Artist of track played'),
})

@api.route('/tracks')
@api.param('limit', type=int, description='number of tracks to return')
class FavoriteTrackList(Resource, ParamDocumenter):
    @api.marshal_list_with(track_fields)
    def get(self):
        args = parser.parse_args()
        start, end = getTimeWindow(args)
        limit = args['limit'] if args['limit'] else 30
        query = db.session.query(Track, db.func.count(Track.id).label('n'))\
            .select_from(History).join(Track, History.track_id == Track.id, isouter=True)\
            .filter(db.func.date(History.played_at) > start, db.func.date(History.played_at) < end)\
            .group_by(Track.id)\
            .order_by(db.desc('n')).limit(limit).all()

        payload = [{'track': track, 'times_played': count} for track, count in query]
        return payload

artist_fields = api.model('Favorite Artist', {
    'artist': fields.String(description='Artist'),
    'times_played': fields.Integer(description='Number of tracks played by the artist')
})

@api.route('/artists')
@api.param('limit', type=int, description='number of artists to return')
class FavoriteArtistList(Resource, ParamDocumenter):
    @api.marshal_list_with(artist_fields)
    def get(self):
        args = parser.parse_args()
        start, end = getTimeWindow(args)
        limit = args['limit'] if args['limit'] else 30
        query = db.session.query(Track.artist,\
            db.func.count(Track.artist).label('n'))\
            .select_from(History).join(Track, History.track_id == Track.id, isouter=True)\
            .filter(db.func.date(History.played_at) > start, db.func.date(History.played_at) < end)\
            .group_by(Track.artist)\
            .order_by(db.desc('n')).limit(limit).all()
        payload = [{'artist': artist, 'times_played': plays} for artist, plays in query]
        return payload

album_fields = api.model('Favorite Album', {
    'album': fields.String(description='Album'),
    'artist': fields.String(descripton="Album's artist"),
    'track_id': fields.String(description='Id of track on album to get album artwork on front end'),
    'times_played': fields.Integer(description='Number of tracks played by the album')
})

@api.route('/albums')
@api.param('limit', type=int, description='number of albums to return')
class FavoriteAlbumList(Resource, ParamDocumenter):
    @api.marshal_list_with(album_fields)
    def get(self):
        args = parser.parse_args()
        start, end = getTimeWindow(args)
        limit = args['limit'] if args['limit'] else 30
        query = db.session.query(Track.album, Track.id, Track.artist)\
            .select_from(History)\
            .join(Track, History.track_id == Track.id, isouter=True)\
            .filter(db.func.date(History.played_at) > start, db.func.date(History.played_at) < end)\
            .order_by(History.played_at).all()
        counts = self.count_album_plays(query)
        counts = [(album, n[1], n[0]) for album, n in sorted(counts.items(), key=lambda item: item[1][0], reverse=True)[:limit]]
        # print(counts)
        payload = [{'album': album.split('---')[0], 'artist': album.split('---')[1], 'track_id': track_id, 'times_played': n} for album, track_id, n in counts]
        return payload

    # Handles frequency counts for tuple
    @staticmethod
    def handle_tuple_update(counts, album, track_id):
        if album in counts.keys():
            if len(counts[album]) != 2:
                counts[album] += (track_id,)
            counts[album] = (counts[album][0] + 1,) + counts[album][1:]
        else:
            counts[album] = (1, track_id)

    # Set counter back to 0 and reset album_tracks
    @staticmethod
    def reset_count(album_tracks, track):
        album_tracks = [track]
        return 1, album_tracks

    # This is a terrible function but it seems to work.
    # I'm honestly not sure how to make this simpler.
    @staticmethod
    def count_album_plays(history):
        print(history)
        album_counts = {}
        prev_album = penult_album = ''
        count = prev_count = 0
        album_tracks = []
        interrupted = False
        prev_track = ''
        for play in history:
            album = f'{play[0]}---{play[2]}'
            if album == prev_album or prev_album == '' or album == penult_album:
                if len(album_tracks) >= 4 and album_tracks[0] == album_tracks[-2] and album_tracks[1] == album_tracks[-1]:
                    FavoriteAlbumList.handle_tuple_update(album_counts, prev_album, prev_track)
                    interrupted = False
                    count = 2
                if album == penult_album and album != prev_album:
                    interrupted = prev_count >= 5
                    album_tracks.pop()
                    count = prev_count
                count += 1
                album_tracks.append(play[1])
            elif count >= 5:
                album_counts[prev_album] = (album_counts[prev_album][0] + (not interrupted),) if prev_album in album_counts.keys() else ((not interrupted),)
                interrupted = False
                prev_count = count
                count, album_tracks = FavoriteAlbumList.reset_count(album_tracks, play[1])
                if len(album_counts[prev_album]) != 2:
                    album_counts[prev_album] += (prev_track,)
            else:
                prev_count = count
                count, album_tracks = FavoriteAlbumList.reset_count(album_tracks, play[1])
            prev_track = play[1]
            prev_album, penult_album = album, prev_album
        if count >= 5:
            FavoriteAlbumList.handle_tuple_update(album_counts, album, prev_track)
            album_tracks = [play[1]]
            _, album_tracks = FavoriteAlbumList.reset_count(album_tracks, play[1])
        return album_counts
