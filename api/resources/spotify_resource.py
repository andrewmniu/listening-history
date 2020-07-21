from flask_restx import Namespace, Resource, fields
from models.spotify import SpotifyAPI
from flask_restx import reqparse

api = Namespace('spotify', description='Access favorite items')

spotify = SpotifyAPI()

parser = reqparse.RequestParser()
parser.add_argument('ids', action='split', location='args')

spotify_track_fields = api.model('Spotify Track', {
    'track_id': fields.String(description='Spotify Track id'),
    'album': fields.String(description="Track's album"),
    'artist': fields.String(description="Track's artist"),
    'artist_id': fields.String(description='Artist id'),
    'artwork': fields.String(description='Link to album artwork')
})

@api.route('/tracks')
@api.param('ids', description='comma separated list of spotify track ids')
class TrackList(Resource):
    @api.marshal_list_with(spotify_track_fields)
    def get(self):
        args = parser.parse_args()
        data = spotify.get_tracks(args['ids'])
        if(data and data['tracks'][0]):
            tracks = data['tracks']
        else:
            api.abort(404, 'id not found')
        payload = [{'track_id': track['id'], 'album': track['album']['name'], 'artist': track['artists'][0]['name'], 'artist_id': track['artists'][0]['id'], 'artwork': track['album']['images'][2]['url']} for track in tracks if track]
        return payload

spotify_artist_fields = api.model('Spotify Artist', {
    'artist_id': fields.String(description='Artist id'),
    'artist': fields.String(description='Artist'),
    'artist_image': fields.String(description='Link to artist image')
})

@api.route('/artists')
@api.param('ids', description='comma separated list of spotify artist ids')
class ArtistList(Resource):
    @api.marshal_list_with(spotify_artist_fields)
    def get(self):
        args = parser.parse_args()
        data = spotify.get_artists(args['ids'])
        if(data and data['artists'][0]):
            artists = data['artists']
        else:
            api.abort(404, 'id not found')
        payload = [{'artist_id': artist['id'], 'artist': artist['name'], 'artist_image': artist['images'][2]['url']} for artist in artists if artist]
        return payload
