import React from "react";
import axios from "axios";
import PropTypes from "prop-types";

class FavoriteTracks extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }

  componentDidMount() {
    this.getTracks();
  }

  componentDidUpdate(prevProps) {
    if (
      (this.props.startDate !== prevProps.startDate) |
      (this.props.endDate !== prevProps.endDate)
    ) {
      this.getTracks();
    }
  }

  renderList = () => {
    return this.state.data.map((track_item, idx) => {
      return (
        <li className="list-group-item" key={idx}>
          <img src={track_item.track.artwork} alt={track_item.track.album} />
          {track_item.track.name} by {track_item.track.artist} played{" "}
          {track_item.times_played} times
        </li>
      );
    });
  };

  getTracks = () => {
    const [startDate, endDate] = this.props.formatDates(
      this.props.startDate,
      this.props.endDate
    );

    let favorites;
    const payload = {
      start: startDate,
      end: endDate,
    };
    axios
      .get("http://localhost:5000/api/favorites/tracks", {
        params: payload,
      })
      .then((res) => {
        favorites = res.data;
      })
      .then(() => {
        const albums = {};
        favorites.forEach((item) => {
          if (!albums[`${item.track.album} ${item.track.artist}`]) {
            albums[`${item.track.album} ${item.track.artist}`] = item.track.id;
          }
        });
        return albums;
      })
      .then((albums) => this.props.getArtwork(albums))
      .then(() => {
        favorites.forEach((item) => {
          item.track.artwork = this.props.albumArtwork[
            `${item.track.album} ${item.track.artist}`
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

FavoriteTracks.propTypes =  {
  formatDates: PropTypes.func.isRequired,
  startDate: PropTypes.instanceOf(Date).isRequired,
  endDate: PropTypes.instanceOf(Date).isRequired,
  getArtwork: PropTypes.func.isRequired,
  albumArtwork: PropTypes.object.isRequired,
  scroller: PropTypes.func.isRequired
}

export default FavoriteTracks;
