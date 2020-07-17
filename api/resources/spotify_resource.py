from flask_restx import Namespace, Resource, fields
from models.spotify import SpotifyAPI
from flask_restx import reqparse

api = Namespace('spotify', description='Access favorite items')

spotify = SpotifyAPI()

parser = reqparse.RequestParser()
parser.add_argument('ids', action='split', location='args')

spotify_track_fields = api.model('Spotify Track', {
    'id': fields.String(description='Spotify Track id'),
    'album': fields.String(description='Album of track played'),
    'artwork': fields.String(description='Link to album artwork')
})

@api.route('/tracks')
@api.param('ids', description='comma separated list of spotify track ids')
class TrackList(Resource):
    @api.marshal_list_with(spotify_track_fields)
    def get(self):
        args = parser.parse_args()
        tracks = spotify.get_tracks(args['ids'])['tracks']
        payload = [{'id': track['id'], 'album': track['album']['name'], 'artwork': track['album']['images'][2]['url']} for track in tracks]
        return payload
