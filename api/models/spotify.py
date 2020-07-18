import requests
import os
from pathlib import Path
from dotenv import load_dotenv
import base64
from functools import wraps
import json

APP_ROOT = os.path.join(os.path.dirname(__file__), '..')
dotenv_path = os.path.join(APP_ROOT, '.env')
load_dotenv(dotenv_path)

class SpotifyAPI:
    def __init__ (self):
        # self.__access_token = self.getAccessToken()
        self.__access_token = 'BQDgdlqGzDfskX2Qt2z6nJKtOF68o3SkAJ83BM9Fx7z2NUA67fDnpBWXGPR-Tzss1WLW0-bjJDTKuj_-YjHZEuytvGLsYDfBC8Oh5tOC-BCDyAsKZMdE3f2za7tG_5FuBw84e7qk7doEQJo91eET3WnkE96K2meRZ2Nk-NX14d6Vg_a0yrkpJUnmNU-M1F8o9t14PyytEUnIc6l3gY'

    def __validateToken(api_call):
        @wraps(api_call)
        def func(self, *args, **kwargs):
            success = False
            while not success:
                response = api_call(self, *args, **kwargs)
                success = response.ok
                if success:
                    return response.json()
                else:
                    if(response.status_code == 401):
                        print('INVALID TOKEN')
                        self.__access_token = self.getAccessToken()
                    else:
                        print('ERROR IN REQUEST')
                        success = True
        return func;

    @staticmethod
    def getAccessToken():
        print('GETTING ACCESS TOKEN')
        CLIENT_ID = os.getenv('CLIENT_ID')
        CLIENT_SECRET = os.getenv('CLIENT_SECRET')
        REFRESH_TOKEN = os.getenv('REFRESH_TOKEN')
        encoded = base64.standard_b64encode(bytes(f"{CLIENT_ID}:{CLIENT_SECRET}", 'utf-8'))
        url = 'https://accounts.spotify.com/api/token'
        response = requests.post(
            url,
            headers={
                'Content-type':'application/x-www-form-urlencoded',
                "Authorization": f"Basic {encoded.decode()}"
            },
            data={
                "grant_type": "refresh_token",
                "refresh_token": REFRESH_TOKEN
            }
        )
        if response.ok:
            return response.json()['access_token']
        else:
            print("refresh token has expired")

    @__validateToken
    def Search(self):
        url= 'https://api.spotify.com/v1/search'
        query = f'Cattails Big Thief'
        payload = {'q': query, 'type': 'track', 'limit': 8}
        success = False
        response = requests.get(
            url,
            params=payload,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.__access_token}"
            }
        )
        return response

    @__validateToken
    def get_tracks(self, track_ids):
        url = 'https://api.spotify.com/v1/tracks/'
        payload={'ids': ','.join(track_ids)}
        response = requests.get(
            url,
            params=payload,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.__access_token}"
            }
        )
        return response
