import React from "react";
import axios from "axios";
import "../css/History.css";
import PaginationWrap from "./Pagination.js";
import Calendar from "./Calendar.js";
import PropTypes from "prop-types";

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
    this.scroller = React.createRef();
  }

  componentDidMount() {
    this.getHistory();
  }

  renderList = () => {
    return this.state.data.map((track_item, idx) => {
      const time = new Date(track_item.played_at);
      return (
        <li className="list-group-item" key={idx}>
          <img src={track_item.track.artwork} alt={track_item.track.album} />
          {track_item.track.name} by {track_item.track.artist} played on{" "}
          {time.toDateString()} at {time.toLocaleTimeString()}
        </li>
      );
    });
  };

  getHistory = () => {
    const [startDate, endDate] = this.props.formatDates(this.state.startDate, this.state.endDate);

    let history;
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
        history = res.data.history;
      })
      .then(() => {
        const albums = {};
        history.forEach((play) => {
          if (!albums[`${play.track.album} ${play.track.artist}`]) {
            albums[`${play.track.album} ${play.track.artist}`] = play.track.id;
          }
        });
        return albums;
      })
      .then((albums) => this.props.getArtwork(albums))
      .then(() => {
        history.forEach((play) => {
          play.track.artwork = this.props.albumArtwork[
            `${play.track.album} ${play.track.artist}`
          ];
        });
        this.setState({ data: history });
        this.scroller.current.scrollTop = 0;
      })
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
        <ul className="history list-group" ref={this.scroller}>
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

History.propTypes = {
  albumArtwork: PropTypes.object.isRequired,
  addArtwork: PropTypes.func.isRequired,
};

export default History;
