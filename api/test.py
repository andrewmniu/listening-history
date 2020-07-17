# from app import *
# from models.history import History
# from models.track import Track
# from sqlalchemy import db.func
# from datetime import date
from models.spotify import SpotifyAPI

api = SpotifyAPI()
# print(api.Search())
print(api.get_tracks(['623gFZ4VYa2EDu1D1sWFm0','65krgqLiZqW12PZAUQ9l2x']))

#
# {
#   "error": {
#     "status": 401,
#     "message": "The access token expired"
#   }
# }

# def count_album_plays(history):
#     album_counts = {}
#     prev_album = penult_album = ''
#     count = prev_count = 0
#     album_tracks = []
#     for play in history:
#         album = play[0]
#         if album == prev_album or prev_album == '' or album == penult_album:
#             if len(album_tracks) >= 4 and album_tracks[0] == album_tracks[-2] and album_tracks[1] == album_tracks[-1]:
#                 album_counts[prev_album] = album_counts[prev_album] + 1 if prev_album in album_counts.keys() else 1
#                 count = 2
#             if album == penult_album and album != prev_album:
#                 count = prev_count
#             count += 1
#             album_tracks.append(play[1])
#         elif count >= 5:
#             album_counts[prev_album] = album_counts[prev_album] + 1 if prev_album in album_counts.keys() else 1
#             count = 1
#             album_tracks = [play[1]]
#         else:
#             prev_count = count
#             count = 1
#             album_tracks = [play[1]]
#         prev_album, penult_album = album, prev_album
#     if count >= 5:
#         album_counts[album] = album_counts[album] + 1 if album in album_counts.keys() else 1
#         count = 1
#         album_tracks = [play[1]]
#     return album_counts

# start = date(2020,1,1)
# end = date(2020,2,1)
#
#
# with app.app_context():
#     # .filter(History.played_at > date(2020, 5, 7) )
#     result = db.session.query(Track, db.func.count(Track.id).label('n'))\
#         .select_from(History).join(Track, History.track_id == Track.id, isouter=True)\
#         .filter(db.func.date(History.played_at) > start, db.func.date(History.played_at) < end)\
#         .group_by(Track.id)\
#         .order_by(db.desc('n')).all()[0:30]
# print(result)
