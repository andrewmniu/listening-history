from flask import Flask, Blueprint
from config import Config
from extensions import db, api

def register_extensions(app):
    db.init_app(app)

    blueprint = Blueprint('api', __name__, url_prefix='/api')
    api.init_app(blueprint)
    app.register_blueprint(blueprint)

def add_namespaces(api):
    from resources.history_resource import api as history_api
    from resources.favorite_resource import api as favorite_api
    from resources.activity_resource import api as activity_api
    from models.track import Track
    api.add_namespace(history_api)
    api.add_namespace(favorite_api)
    api.add_namespace(activity_api)

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    register_extensions(app)
    add_namespaces(api)

    return app

app = create_app()

if __name__ == '__main__':
    app.run()
