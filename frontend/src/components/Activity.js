import React from "react";
import ActivityByPeriod from "./graphs/ActivityByPeriod.js";
import ActivityByTime from "./graphs/ActivityByTime.js";
import PropTypes from "prop-types";

class Activity extends React.Component {
  render() {
    return (
      <React.Fragment>
        <h1>Activity</h1>
        <ActivityByPeriod />
        <ActivityByTime />
      </React.Fragment>
    );
  }
}

export default Activity;
