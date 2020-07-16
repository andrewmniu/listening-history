import React from "react";
import axios from "axios";
import "../css/History.css";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import { Popover, OverlayTrigger, Button } from "react-bootstrap";
import PropTypes from "prop-types";

class History extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      endDate: new Date(),
      startDate: new Date(2019, 5, 13),
    };
  }

  componentDidMount() {
    this.getHistory(this.state.startDate, this.state.endDate);
  }

  renderItems = () => {
    return this.state.data.map((track_item, idx) => {
      const time = new Date(track_item.played_at);
      return (
        <li className="list-group-item" key={idx}>
          {time.toLocaleDateString()} at {time.toLocaleTimeString()}{" "}
          {track_item.track.name} by {track_item.track.artist}
        </li>
      );
    });
  };

  getHistory = (start, end) => {
    const startDate = start.toISOString().substring(0, 10);
    let endDate = new Date(end.getTime() + 86400000);
    endDate = endDate.toISOString().substring(0, 10);

    axios
      .get("http://localhost:5000/api/history", {
        params: { start: startDate, end: endDate },
      })
      .then((res) => this.setState({ data: res.data }));
  };

  handleDates = async (item) => {
    await this.setState(item.selection);
    this.getHistory(this.state.startDate, this.state.endDate);
  };

  getPopover = () => {
    const selectionRange = {
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      key: "selection",
    };
    return (
      <Popover id="popover-basic">
        <Popover.Title as="h3">Popover right</Popover.Title>
        <Popover.Content>
          <DateRange className="calendar" ranges={[selectionRange]} minDate={new Date(2019, 5, 13)} maxDate={new Date()} shownDate={new Date()} onChange={this.handleDates} />
        </Popover.Content>
      </Popover>
    );
  };

  // const selectionRange = {
  //   startDate: this.state.startDate,
  //   endDate: this.state.endDate,
  //   key: "selection",
  // };
  // <DateRange ranges={[selectionRange]} onChange={this.handleDates} />

  render() {
    return (
      <React.Fragment>
        <h1>History</h1>
        <OverlayTrigger trigger="click" placement="bottom" overlay={this.getPopover()} rootClose={true}>
          <button className="btn btn-primary">Calendar</button>
        </OverlayTrigger>
        <ul className="history list-group">{this.renderItems()}</ul>
      </React.Fragment>
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

export default History;
