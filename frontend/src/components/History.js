import React from "react";
import axios from "axios";
import "../css/History.css";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import { Popover, OverlayTrigger, Button, Pagination } from "react-bootstrap";
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
  }

  componentDidMount() {
    this.getHistory();
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
      .then((res) =>
        this.setState({ data: res.data.history, pages: res.data.pages })
      );
  };

  handleDates = async (item) => {

    await this.setState({startDate: item.selection.startDate, endDate: item.selection.endDate, page: 1});
    this.getHistory();
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
          <DateRange
            className="calendar"
            ranges={[selectionRange]}
            minDate={new Date(2019, 5, 13)}
            maxDate={new Date()}
            shownDate={new Date()}
            onChange={this.handleDates}
          />
        </Popover.Content>
      </Popover>
    );
  };

  createPagination = () => {
    const items = [];
    const generate = (first, last) => {
      for (let i = first; i <= last; i++) {
        const active = i === this.state.page ? "active" : "";
        items.push(
          <Pagination.Item
            key={i}
            active={i === this.state.page}
            onClick={this.handlePagination}
          >
            {i}
          </Pagination.Item>
        );
      }
    };
    if (this.state.pages <= 7){
      generate(1, this.state.pages)
      return items;
    }

    let first, last;
    if (this.state.page <= 3) {
      first = 1;
      last = 5;
      generate(first, last);
      items.push(<Pagination.Ellipsis disabled />);
      items.push(
        <Pagination.Item
          key={this.state.pages}
          active={this.state.pages === this.state.page}
          onClick={this.handlePagination}
        >
          {this.state.pages}
        </Pagination.Item>
      );
    } else if (this.state.page >= this.state.pages - 2) {
      first = this.state.pages - 4;
      last = this.state.pages;
      items.push(
        <Pagination.Item
          key={1}
          active={1 === this.state.page}
          onClick={this.handlePagination}
        >
          1
        </Pagination.Item>
      );
      items.push(<Pagination.Ellipsis disabled />);
      generate(first, last);
    } else {
      first = this.state.page - 2;
      last = this.state.page + 2;
      items.push(
        <Pagination.Item
          key={1}
          active={1 === this.state.page}
          onClick={this.handlePagination}
        >
          1
        </Pagination.Item>
      );
      if (this.state.page !== 4){
        items.push(<Pagination.Ellipsis disabled />);
      }
      generate(first, last);
      if (this.state.page !== this.state.pages - 3){
        items.push(<Pagination.Ellipsis disabled />);
      }
      items.push(
        <Pagination.Item
          key={this.state.pages}
          active={this.state.pages === this.state.page}
          onClick={this.handlePagination}
        >
          {this.state.pages}
        </Pagination.Item>
      );
    }

    return items;
  };

  handlePagination = async (e) => {
    let page;
    if (e.target.classList.contains("disabled") || e.target.tagName === "SPAN") {
      return;
    }
    switch (e.target.text) {
      case "‹":
        page = this.state.page === 1 ? 1 : this.state.page - 1;
        break;
      case "›":
        page =
          this.state.page === this.state.pages
            ? this.state.pages
            : this.state.page + 1;
        break;
      default:
        page = parseInt(e.target.text);
        break;
    }
    await this.setState({ page });
    this.getHistory();
  };

  render() {
    return (
      <React.Fragment>
        <h1>History</h1>
        <OverlayTrigger
          trigger="click"
          placement="bottom"
          overlay={this.getPopover()}
          rootClose={true}
        >
          <button className="btn btn-primary">Calendar</button>
        </OverlayTrigger>
        <ul className="history list-group">{this.renderItems()}</ul>
        <Pagination size="sm" activePage={this.state.page}>
          <li
            class={`page-item ${this.state.page === 1 ? "disabled" : ""}`}
            onClick={this.handlePagination}
          >
            <a class="page-link" href="#">
              ‹
            </a>
          </li>
          {this.createPagination()}
          <li class={`page-item ${
            this.state.page === this.state.pages ? "disabled" : ""
          }`} onClick={this.handlePagination}>
            <a
              class="page-link"
              href="#"
            >
              ›
            </a>
          </li>
        </Pagination>
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
