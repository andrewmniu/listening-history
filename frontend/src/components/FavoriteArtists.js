import React from "react";
import axios from "axios";
import PropTypes from "prop-types";

class FavoriteArtists extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      artistImages: {},
      data: [],
    };
  }

  componentDidMount() {
    this.getArtists();
  }

  componentDidUpdate(prevProps) {
    if (
      (this.props.startDate !== prevProps.startDate) |
      (this.props.endDate !== prevProps.endDate)
    ) {
      this.getArtists();
    }
  }

  renderList = () => {
    return this.state.data.map((artist, idx) => {
      return (
        <li className="list-group-item" key={idx}>
          <img src={artist.artist_image} alt={artist.artist} />
          {artist.artist} - {artist.times_played} tracks played
        </li>
      );
    });
  };

  getArtists = () => {
    const [startDate, endDate] = this.props.formatDates(
      this.props.startDate,
      this.props.endDate
    );
    let favorites = [];
    const payload = {
      start: startDate,
      end: endDate,
    };
    axios
      .get("http://localhost:5000/api/favorites/artists", {
        params: payload,
      })
      .then((res) => {
        favorites = res.data;
      })
      .then(() => {
        const artists = {};
        favorites.forEach((artist) => {
          if (!artists[artist.artist] & artist.artist !== 'Spotify') {
            artists[artist.artist] = artist.track_id;
          }
        });
        return artists;
      })
      .then((artists) => this.getImages(artists))
      .then(() => {
        favorites.forEach((artist) => {
          artist.artist_image = this.state.artistImages[artist.artist];
        });
        this.setState({ data: favorites });
        this.props.scroller.current.scrollTop = 0;
      });
  };

  tracksToArtists = async (notCached) => {
    if (Object.keys(notCached).length) {
      return await axios
        .get("http://localhost:5000/api/spotify/tracks", {
          params: { ids: Object.values(notCached) + "" },
        })
        .then((res) => {
          for (let i = 0; i < Object.keys(notCached).length; i++) {
            notCached[Object.keys(notCached)[i]] = res.data[i].artist_id;
          }
          return notCached;
        })
        .then((notCached) => {
          return notCached;
        });
    } else {
      return notCached
    }
  };

  spotifyArtistImage = async (notCached) => {
    if (Object.keys(notCached).length) {
      await axios
        .get("http://localhost:5000/api/spotify/artists", {
          params: { ids: Object.values(notCached) + "" },
        })
        .then((res) => {
          for (let i = 0; i < Object.keys(notCached).length; i++) {
            notCached[Object.keys(notCached)[i]] = res.data[i].artist_image;
          }
          return notCached;
        })
        .then((notCached) => {
          this.setState({
            artistImages: { ...this.state.artistImages, ...notCached },
          });
        });
    }
  };

  getImages = async (artists) => {
    let notCached = {};
    Object.keys(artists).forEach((artist) => {
      if (!this.state.artistImages[artist] & !notCached[artist]) {
        notCached[artist] = artists[artist];
      }
    });
    notCached = await this.tracksToArtists(notCached);
    await this.spotifyArtistImage(notCached);
  };

  render() {
    return this.renderList();
  }
}

FavoriteArtists.propTypes = {
  formatDates: PropTypes.func.isRequired,
  startDate: PropTypes.instanceOf(Date).isRequired,
  endDate: PropTypes.instanceOf(Date).isRequired,
  scroller: PropTypes.object.isRequired,
};

export default FavoriteArtists;
