import React from "react";
import Calendar from "./Calendar.js";
import FavoriteTracks from "./FavoriteTracks.js";
import FavoriteAlbums from "./FavoriteAlbums.js";
import PropTypes from "prop-types";

class Favorites extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      endDate: new Date(),
      startDate: new Date(2019, 5, 13),
      item: "Albums",
    };
    this.scroller = React.createRef();
  }

  handleItemType = () => {
    switch (this.state.item) {
      case "Tracks":
        return (
          <FavoriteTracks
            formatDates={this.props.formatDates}
            startDate={this.state.startDate}
            endDate={this.state.endDate}
            getArtwork={this.props.getArtwork}
            albumArtwork={this.props.albumArtwork}
            scroller={this.scroller}
          ></FavoriteTracks>
        );
      case "Albums":
        return (
          <FavoriteAlbums
            formatDates={this.props.formatDates}
            startDate={this.state.startDate}
            endDate={this.state.endDate}
            getArtwork={this.props.getArtwork}
            albumArtwork={this.props.albumArtwork}
            scroller={this.scroller}
          ></FavoriteAlbums>
        );
      default:
        return <p>Error</p>;
    }
  };

  handleDates = (item) => {
    this.setState({
      startDate: item.selection.startDate,
      endDate: item.selection.endDate,
    });
  };

  render() {
    return (
      <React.Fragment>
        <h1>Favorite {this.state.item}</h1>
        <h4>
          {this.state.startDate.toDateString().substring(4)} -{" "}
          {this.state.endDate.toDateString().substring(4)}
        </h4>
        <Calendar
          startDate={this.state.startDate}
          endDate={this.state.endDate}
          handleDates={this.handleDates}
        ></Calendar>
        <ul className="history list-group" ref={this.scroller}>
          {this.handleItemType()}
        </ul>
      </React.Fragment>
    );
  }
}

Favorites.propTypes = {
  albumArtwork: PropTypes.object.isRequired,
  getArtwork: PropTypes.func.isRequired,
  formatDates: PropTypes.func.isRequired
};

export default Favorites;
