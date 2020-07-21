import React from "react";
import axios from "axios";
import PropTypes from "prop-types";

class FavoriteAlbums extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }

  componentDidMount() {
    this.getAlbums();
  }

  componentDidUpdate(prevProps) {
    if (
      (this.props.startDate !== prevProps.startDate) |
      (this.props.endDate !== prevProps.endDate)
    ) {
      this.getAlbums();
    }
  }

  renderList = () => {
    return this.state.data.map((album, idx) => {
      return (
        <li className="list-group-item" key={idx}>
          <img src={album.artwork} alt={album.album} />
          {album.album} by {album.artist} played{" "}
          {album.times_played} times
        </li>
      );
    });
  };

  getAlbums = () => {
    const [startDate, endDate] = this.props.formatDates(
      this.props.startDate,
      this.props.endDate
    );

    let favorites = [];
    const payload = {
      start: startDate,
      end: endDate,
      limit: 20
    };
    axios
      .get("http://localhost:5000/api/favorites/albums", {
        params: payload,
      })
      .then((res) => {
        favorites = res.data;
      })
      .then(() => {
        const albums = {};
        favorites.forEach((album) => {
          if (!albums[`${album.album} ${album.artist}`]) {
            albums[`${album.album} ${album.artist}`] = album.track_id;
          }
        });
        return albums;
      })
      .then((albums) => this.props.getArtwork(albums))
      .then(() => {
        favorites.forEach((album) => {
          album.artwork = this.props.albumArtwork[
            `${album.album} ${album.artist}`
          ];
        });
        this.setState({ data: favorites });
        this.props.scroller.current.scrollTop = 0;
      });
  };

  render() {
    return this.renderList();
  }
}

FavoriteAlbums.propTypes =  {
  formatDates: PropTypes.func.isRequired,
  startDate: PropTypes.instanceOf(Date).isRequired,
  endDate: PropTypes.instanceOf(Date).isRequired,
  getArtwork: PropTypes.func.isRequired,
  albumArtwork: PropTypes.object.isRequired,
  scroller: PropTypes.func.isRequired
}

export default FavoriteAlbums;
