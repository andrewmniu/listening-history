import { Pagination } from "react-bootstrap";
import React from "react";
import PropTypes from "prop-types";

class PaginationWrap extends React.Component {
  createPagination = () => {
    const items = [];
    const generate = (first, last) => {
      for (let i = first; i <= last; i++) {
        items.push(
          <Pagination.Item
            key={i}
            active={i === this.props.page}
            onClick={this.handlePagination}
          >
            {i}
          </Pagination.Item>
        );
      }
    };
    if (this.props.pages <= 7) {
      generate(1, this.props.pages);
      return items;
    }

    let first, last;
    if (this.props.page <= 3) {
      first = 1;
      last = 5;
      generate(first, last);
      items.push(<Pagination.Ellipsis key={0} disabled />);
      items.push(
        <Pagination.Item
          key={this.props.pages}
          active={this.props.pages === this.props.page}
          onClick={this.handlePagination}
        >
          {this.props.pages}
        </Pagination.Item>
      );
    } else if (this.props.page >= this.props.pages - 2) {
      first = this.props.pages - 4;
      last = this.props.pages;
      items.push(
        <Pagination.Item
          key={1}
          active={1 === this.props.page}
          onClick={this.handlePagination}
        >
          1
        </Pagination.Item>
      );
      items.push(<Pagination.Ellipsis key={0} disabled />);
      generate(first, last);
    } else {
      first = this.props.page - 2;
      last = this.props.page + 2;
      items.push(
        <Pagination.Item
          key={1}
          active={1 === this.props.page}
          onClick={this.handlePagination}
        >
          1
        </Pagination.Item>
      );
      if (this.props.page !== 4) {
        items.push(<Pagination.Ellipsis key={0} disabled />);
      }
      generate(first, last);
      if (this.props.page !== this.props.pages - 3) {
        items.push(<Pagination.Ellipsis key={this.props.pages+1} disabled />);
      }
      items.push(
        <Pagination.Item
          key={this.props.pages}
          active={this.props.pages === this.props.page}
          onClick={this.handlePagination}
        >
          {this.props.pages}
        </Pagination.Item>
      );
    }

    return items;
  };

  handlePagination = (e) => {
    let page;
    if (
      e.target.classList.contains("disabled") ||
      e.target.tagName === "SPAN"
    ) {
      return;
    }
    switch (e.target.text) {
      case "‹":
        page = this.props.page === 1 ? 1 : this.props.page - 1;
        break;
      case "›":
        page =
          this.props.page === this.props.pages
            ? this.props.pages
            : this.props.page + 1;
        break;
      default:
        page = parseInt(e.target.text);
        break;
    }
    this.props.setPage(page);
  };

  render() {
    return (
      <Pagination size="sm" activepage={this.props.page}>
        <li
          className={`page-item ${this.props.page === 1 ? "disabled" : ""}`}
          onClick={this.handlePagination}
        >
          <a className="page-link" href="#">
            ‹
          </a>
        </li>
        {this.createPagination()}
        <li
          className={`page-item ${
            this.props.page === this.props.pages ? "disabled" : ""
          }`}
          onClick={this.handlePagination}
        >
          <a className="page-link" href="#">
            ›
          </a>
        </li>
      </Pagination>
    );
  }
}

PaginationWrap.propTypes = {
  page: PropTypes.number.isRequired,
  pages: PropTypes.number.isRequired,
  setPage: PropTypes.func.isRequired
}

export default PaginationWrap;
