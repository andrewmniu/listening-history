import os
from pathlib import Path
from dotenv import load_dotenv

APP_ROOT = os.path.join(os.path.dirname(__file__), '.')
dotenv_path = os.path.join(APP_ROOT, '.env')
load_dotenv(dotenv_path)

class Config:
    SQLALCHEMY_TRACK_MODIFICATIONS=False
    ENV='development'
    DEBUG=True
    db_host = '127.0.0.1'
    db_user = 'andrew'
    db_password = os.getenv('DB_PASSWORD_LOCAL')
    database ='listening_history'

    db_host = os.getenv('DB_HOST')
    db_user = os.getenv('DB_USER')
    db_password = os.getenv('DB_PASSWORD')
    database ='bnxju3rtfsxvdnrkpfha'

    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{db_user}:{db_password}@{db_host}/{database}"
