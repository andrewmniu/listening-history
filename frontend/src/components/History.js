import React from "react";
import axios from "axios";
import PropTypes from "prop-types";

class History extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }

  componentDidMount() {
    axios
      .get("http://localhost:5000/api/history/")
      .then((res) => this.setState({ data: res.data }));
  }

  renderItems = () => {
    return this.state.data.map((track, idx) => {
      const time = new Date(track.played_at);
      return (
        <li key={idx}>
          {time.toLocaleDateString()} at {time.toLocaleTimeString()}{" "}
          {track.name} by {track.artist}
        </li>
      );
    });
  };

  render() {
    return (
      <React.Fragment>
        <h1>History</h1>
        {this.renderItems()}
      </React.Fragment>
    );
  }
}

export default History;
