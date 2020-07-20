import React from "react";
import axios from "axios";
import Calendar from "./Calendar.js";
import PropTypes from "prop-types";

class Favorites extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      endDate: new Date(),
      startDate: new Date(2019, 5, 13),
      page: 1,
      pages: 1,
    };
    this.scroller = React.createRef();
  }

  componentDidMount() {
    this.getTracks();
  }

  renderList = () => {
    return this.state.data.map((track_item, idx) => {
      return (
        <li className="list-group-item" key={idx}>
          <img src={track_item.track.artwork} alt={track_item.track.album}/>
          {track_item.track.name} by {track_item.track.artist} played{" "}
          {track_item.times_played} times
        </li>
      );
    });
  };

  getTracks = () => {
    const [startDate, endDate] = this.props.formatDates(this.state.startDate, this.state.endDate);

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
        this.scroller.current.scrollTop = 0;
      });
  };

  getArtwork = async (favorites) => {
    const tracks = favorites.map((item) => {
      return {
        album: `${item.track.album} ${item.track.artist}`,
        id: item.track.id,
        albumArtwork: "",
      };
    });
    const notCached = {};
    tracks.forEach((track) => {
      if (this.props.albumArtwork[track.album]) {
        track.albumArtwork = this.props.albumArtwork[track.album];
      } else if (!notCached[track.album]) {
        notCached[track.album] = track.id;
      }
    });
    if (Object.keys(notCached).length) {
      await axios
        .get("http://localhost:5000/api/spotify/tracks", {
          params: { ids: Object.values(notCached) + "" },
        })
        .then((res) => {
          this.props.addArtwork(notCached, res.data);
        });
    }
    favorites.forEach((item) => {
      item.track.artwork = this.props.albumArtwork[
        `${item.track.album} ${item.track.artist}`
      ];
    });
    this.setState({ data: favorites });
    this.scroller.current.scrollTop = 0;
  };

  handleDates = async (item) => {
    await this.setState({
      startDate: item.selection.startDate,
      endDate: item.selection.endDate,
    });
    this.getTracks();
  };

  render() {
    return (
      <React.Fragment>
        <h1>Favorites</h1>
        <h4>
          {this.state.startDate.toDateString().substring(4)} -{" "}
          {this.state.endDate.toDateString().substring(4)}
        </h4>
        <Calendar
          startDate={this.state.startDate}
          endDate={this.state.endDate}
          handleDates={this.handleDates}
        ></Calendar>
        <ul className="history list-group"
          ref={this.scroller}>{this.renderList()}</ul>
      </React.Fragment>
    );
  }
}

Favorites.propTypes = {
  albumArtwork: PropTypes.object.isRequired,
  addArtwork: PropTypes.func.isRequired,
};

export default Favorites;
