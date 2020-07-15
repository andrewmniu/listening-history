from flask_restx import reqparse
from datetime import datetime, timedelta

parser = reqparse.RequestParser()
parser.add_argument('start', location='args')
parser.add_argument('end', location='args')
parser.add_argument('limit', type=int, location='args')

def getTimeWindow(args):
    start = datetime.strptime(args['start'], '%Y-%m-%d') - timedelta(days=1) if args['start'] else datetime(1970,1,1)
    end = datetime.strptime(args['end'], '%Y-%m-%d') if args['end'] else datetime(2200,1,1)
    return start, end
