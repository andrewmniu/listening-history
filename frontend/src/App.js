import React from "react";
import axios from "axios";
import Header from "./components/Header.js";
import History from "./components/History.js";
import Favorites from "./components/Favorites.js";

import "./App.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      albumArtwork: {},
    };
  }

  spotifyArtwork = async (notCached) => {
    if (Object.keys(notCached).length) {
      await axios
        .get("http://localhost:5000/api/spotify/tracks", {
          params: { ids: Object.values(notCached) + "" },
        })
        .then((res) => {
          for (let i = 0; i < Object.keys(notCached).length; i++) {
            notCached[Object.keys(notCached)[i]] = res.data[i].artwork;
          }
          return notCached
        })
        .then((notCached) => {
          this.setState({
            albumArtwork: { ...this.state.albumArtwork, ...notCached },
          });
        })
    }
  };

  // albums: {'album artist': 'track id of track on album'}
  getArtwork = async (albums) => {
    const notCached = {};
    Object.keys(albums).forEach((album) => {
      if (!this.state.albumArtwork[album] & !notCached[album]) {
        notCached[album] = albums[album];
      }
    });
    await this.spotifyArtwork(notCached);
  };

  formatDates = (start, end) => {
    const startDate = start.toISOString().substring(0, 10);
    let endDate = new Date(end.getTime() + 86400000);
    endDate = endDate.toISOString().substring(0, 10);
    return [startDate, endDate]
  }

  render() {
    return (
      <div className="App">
        <Header />
        <History
          albumArtwork={this.state.albumArtwork}
          getArtwork={this.getArtwork}
          formatDates={this.formatDates}
        />
      <Favorites
        albumArtwork={this.state.albumArtwork}
        getArtwork={this.getArtwork}
        formatDates={this.formatDates}
        />
      </div>
    );
  }
}

axios.interceptors.request.use(
  (config) => {
    console.log(
      `${config.method.toUpperCase()} request sent to ${
        config.url
      } at ${new Date().getTime()}`
    );
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default App;
