from extensions import db

class Track(db.Model):
    __tablename__ = 'tracks'
    id =  db.Column(db.String(30), primary_key=True)
    name = db.Column(db.String(255))
    album = db.Column(db.String(255))
    artist = db.Column(db.String(100))
    history = db.relationship('History', backref='track', lazy=True)

    def __repr__(self):
        return f"Track({self.name}, {self.album}, {self.artist})"
