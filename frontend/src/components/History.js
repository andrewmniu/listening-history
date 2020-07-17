import React from "react";
import axios from "axios";
import "../css/History.css";
import PropTypes from "prop-types";
import PaginationWrap from "./Pagination.js";
import Calendar from "./Calendar.js";

class History extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      endDate: new Date(),
      startDate: new Date(2019, 5, 13),
      page: 1,
      pages: 1,
    };
  }

  componentDidMount() {
    this.getHistory();
  }

  renderList = () => {
    return this.state.data.map((track_item, idx) => {
      const time = new Date(track_item.played_at);
      return (
        <li className="list-group-item" key={idx}>
          <img src={track_item.track.artwork} />
          {time.toLocaleDateString()} at {time.toLocaleTimeString()}{" "}
          {track_item.track.name} by {track_item.track.artist}
        </li>
      );
    });
  };

  getHistory = () => {
    const startDate = this.state.startDate.toISOString().substring(0, 10);
    let endDate = new Date(this.state.endDate.getTime() + 86400000);
    endDate = endDate.toISOString().substring(0, 10);
    const payload = {
      start: startDate,
      end: endDate,
      page: this.state.page,
      per_page: 50,
    };
    axios
      .get("http://localhost:5000/api/history", {
        params: payload,
      })
      .then((res) => {
        this.setState({ pages: res.data.pages });
        return res.data.history;
      })
      .then((history) => this.getArtwork(history));
  };

  getArtwork = (history) => {
    const track_ids = history.map((play) => play.track.id);
    axios
      .get("http://localhost:5000/api/spotify/tracks", {
        params: { ids: track_ids + "" },
      })
      .then((res) => {
        for (let i = 0; i < history.length; i++) {
          history[i].track.artwork = res.data[i].artwork;
        }
        this.setState({ data: history });
        this.refs.scroller.scrollTop = 0;
      });
  };

  handleDates = async (item) => {
    await this.setState({
      startDate: item.selection.startDate,
      endDate: item.selection.endDate,
      page: 1,
    });
    this.getHistory();
  };

  setPage = async (page) => {
    await this.setState({ page });
    this.getHistory();
  };

  render() {
    return (
      <React.Fragment>
        <h1>History</h1>
        <Calendar
          startDate={this.state.startDate}
          endDate={this.state.endDate}
          handleDates={this.handleDates}
        ></Calendar>
        <ul className="history list-group" ref="scroller">
          {this.renderList()}
        </ul>

        <PaginationWrap
          page={this.state.page}
          pages={this.state.pages}
          setPage={this.setPage}
        ></PaginationWrap>
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
