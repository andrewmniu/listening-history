import React from 'react'
import PropTypes from 'prop-types'
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import { Popover, OverlayTrigger } from "react-bootstrap";

class Calendar extends React.Component {

  getPopover = () => {
    const selectionRange = {
      startDate: this.props.startDate,
      endDate: this.props.endDate,
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
            onChange={this.props.handleDates}
          />
        </Popover.Content>
      </Popover>
    );
  };

  render () {
    return(
      <OverlayTrigger
        trigger="click"
        placement="bottom"
        overlay={this.getPopover()}
        rootClose={true}
      >
        <button className="btn btn-primary">Calendar</button>
      </OverlayTrigger>
    )
  }
}

export default Calendar;
