from flask_restx import Namespace, Resource, fields, reqparse, inputs
from models.history import History
from models.track import Track
from extensions import db
from datetime import datetime, timedelta
# from resources import parser, getTimeWindow

api = Namespace('activity', description='Access listening activity')

parser = reqparse.RequestParser()
parser.add_argument('desc', type=inputs.boolean, default=True, location='args')

@api.param('desc', type=bool, description='order of results')
class ParamDocumenter():
    pass

day_fields = api.model('Activity - Daily', {
    'date': fields.Date(description='Day'),
    'plays': fields.Integer(description='Number of tracks played on this date')
})

@api.route('/daily')
class DailyActivity(Resource, ParamDocumenter):
    @api.marshal_list_with(day_fields)
    def get(self):
        args = parser.parse_args()
        order = db.desc(db.func.date(History.played_at)) if args['desc'] else db.func.date(History.played_at)
        query = db.session.query(db.func.date(History.played_at), db.func.count(History.track_id))\
        .group_by(db.func.date(History.played_at))\
        .order_by(order).all()
        payload = [{'date': date, 'plays': plays} for date, plays in query]
        return payload

week_fields = api.model('Activity - Weekly', {
    'week': fields.Date(description='First day of week'),
    'plays': fields.Integer(description='Number of tracks played in this week')
})

@api.route('/weekly')
class WeeklyActivity(Resource):
    @api.marshal_list_with(week_fields)
    def get(self):
        args = parser.parse_args()
        order = db.desc(db.func.date(History.played_at)) if args['desc'] else db.func.date(History.played_at)
        query = db.session.query(db.func.date(History.played_at),        db.func.count(History.track_id))\
            .group_by(db.func.yearweek(History.played_at))\
            .order_by(order).all()
            
        payload = []
        for week, plays in query:
            week = week - timedelta(days=week.weekday()-6) if week.weekday() == 6 else week - timedelta(days=week.weekday()+1)
            payload.append({'week': week, 'plays': plays})
        return payload

month_fields = api.model('Activity - Monthly', {
    'month': fields.String(description='Month'),
    'year': fields.Integer(description='Year'),
    'plays': fields.Integer(description='Number of tracks played in this month')
})

@api.route('/monthly')
class MonthlyActivity(Resource):
    @api.marshal_list_with(month_fields)
    def get(self):
        # args = parser.parse_args()
        # order = db.desc(db.func.date(History.played_at)) if args['desc'] else db.func.date(History.played_at)
        query = db.session.query(db.func.year(History.played_at).label('Year'), db.func.monthname(History.played_at).label('Month'), db.func.count(History.track_id))\
        .group_by('Year', 'Month')\
        .order_by(db.desc('Year'), db.desc(db.func.month(History.played_at))).all()
        payload = [{'month': month, 'year': year, 'plays': plays} for year, month, plays in query]
        return payload

hour_of_day = api.model('Activity - Hour of Day', {
    'hour': fields.Integer(description='Hour of the day'),
    'plays': fields.Integer(description='Number of tracks played during this hour of the day'),
})

@api.route('/hour-of-day')
class HourOfDay(Resource):
    @api.marshal_list_with(hour_of_day)
    def get(self):
        query = db.session.query(db.func.hour(History.played_at).label('Hour'), db.func.count(History.track_id))\
        .group_by('Hour')\
        .order_by('Hour').all()
        payload = [{'hour': hour, 'plays': plays} for hour, plays in query]
        return payload

day_of_week = api.model('Activity - Day of Week', {
    'day': fields.String(description='Day of the week'),
    'plays': fields.Integer(description='Number of tracks played during this day of the week'),
})

@api.route('/day-of-week')
class DayOfWeek(Resource):
    @api.marshal_list_with(day_of_week)
    def get(self):
        query = db.session.query(db.func.dayname(History.played_at).label('Day'), db.func.count(History.track_id))\
        .group_by('Day')\
        .order_by(db.func.dayofweek(History.played_at)).all()
        payload = [{'day': day, 'plays': plays} for day, plays in query]
        return payload

month_of_year = api.model('Activity - Month of Year', {
    'month': fields.String(description='Month of the year'),
    'plays': fields.Integer(description='Number of tracks played during this month of the year'),
})

@api.route('/month-of-year')
class MonthOfYear(Resource):
    @api.marshal_list_with(month_of_year)
    def get(self):
        query = db.session.query(db.func.monthname(History.played_at).label('Month'), db.func.count(History.track_id))\
        .group_by('Month')\
        .order_by(db.func.month(History.played_at)).all()
        payload = [{'month': month, 'plays': plays} for month, plays in query]
        return payload
