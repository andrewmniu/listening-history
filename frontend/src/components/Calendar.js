import React from "react";
import PropTypes from "prop-types";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import { subDays, subMonths } from "date-fns";
import { Popover, OverlayTrigger } from "react-bootstrap";

// earliest recorded Spotify listening history
const minDate = new Date(2019, 5, 13);

class Calendar extends React.Component {
  presetDates = (e) => {
    let startDate, endDate;
    endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
    switch (e.target.value) {
      case "This Week":
        startDate = subDays(endDate, 7);
        break;
      case "Last Week":
        endDate = subDays(endDate, 7);
        endDate.setHours(0, 0, 0, 0);
        startDate = subDays(endDate, 7);
        break;
      case "This Month":
        startDate = subMonths(endDate, 1);
        break;
      case "Last 3 Months":
        startDate = subMonths(endDate, 3);
        break;
      case "Last 6 Months":
        startDate = subMonths(endDate, 6);
        break;
      case "All Time":
        startDate = minDate;
        break;
      default:
        console.log("error");
    }
    // matches format of calendar selection
    const items = {
      selection: {
        startDate,
        endDate,
      },
    };
    this.props.handleDates(items);
  };

  getPopover = () => {
    const selectionRange = {
      startDate: this.props.startDate,
      endDate: this.props.endDate,
      key: "selection",
    };
    return (
      <Popover id="popover-basic">
        <Popover.Title>
          <button type="button" onClick={this.presetDates} value="This Week">
            This Week
          </button>
          <button type="button" onClick={this.presetDates} value="Last Week">
            Last Week
          </button>
          <button type="button" onClick={this.presetDates} value="This Month">
            This Month
          </button>
          <button
            type="button"
            onClick={this.presetDates}
            value="Last 3 Months"
          >
            Last 3 Months
          </button>
          <button
            type="button"
            onClick={this.presetDates}
            value="Last 6 Months"
          >
            Last 6 Months
          </button>
          <button type="button" onClick={this.presetDates} value="All Time">
            All Time
          </button>
        </Popover.Title>
        <Popover.Content>
          <DateRange
            className="calendar"
            ranges={[selectionRange]}
            minDate={minDate}
            maxDate={new Date()}
            shownDate={this.props.endDate}
            onChange={this.props.handleDates}
          />
        </Popover.Content>
      </Popover>
    );
  };

  render() {
    return (
      <OverlayTrigger
        trigger="click"
        placement="bottom"
        overlay={this.getPopover()}
        rootClose={true}
      >
        <button className="btn btn-primary">Calendar</button>
      </OverlayTrigger>
    );
  }
}

Calendar.propTypes = {
  startDate: PropTypes.instanceOf(Date).isRequired,
  endDate: PropTypes.instanceOf(Date).isRequired,
  handleDates: PropTypes.func.isRequired,
  presetDates: PropTypes.func.isRequired,
};

export default Calendar;
