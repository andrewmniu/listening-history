from extensions import db

class History(db.Model):
    __tablename = 'history'
    played_at = db.Column(db.DateTime, primary_key=True)
    track_id = db.Column(db.String(30), db.ForeignKey('tracks.id'))

    def __repr__(self):
        return f"TrackPlay({self.played_at}, {self.track.name} by {self.track.artist})"
