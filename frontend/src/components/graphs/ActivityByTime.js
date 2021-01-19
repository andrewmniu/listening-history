import React from "react";
import PropTypes from "prop-types";
import Chart from "react-apexcharts";
import axios from "axios";

const graphInfo = {
  day: {
    title: "Number of Songs Played by Day of Week",
    endpoint: "day-of-week",
  },
  hour: {
    title: "Number of Songs Played by Hour of Day",
    endpoint: "hour-of-day",
  },
  month: {
    title: "Number of Songs Played by Month of Year",
    endpoint: "month-of-year",
  },
};

class ActivityByTime extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      options: {
        chart: {
          background: "#f4f4f4",
          foreColor: "#333",
        },
        xaxis: {
          categories: [],
        },
        plotOptions: {
          bar: {
            horizontal: false,
          },
        },
        fill: {
          colors: ["#f44336"],
        },
        dataLabels: {
          enabled: false,
        },
        title: {
          text: "",
          align: "center",
          margin: 20,
          offsetY: 20,
          style: {
            fontSize: "25px",
          },
        },
      },
      series: [
        {
          name: "",
          data: [],
        },
      ],
    };
  }

  componentDidMount() {
    this.getData("day");
  }

  getData = (time_frame) => {
    let labels = {
      formatter: function (value) {
        const meridiem = value < 12 ? "AM" : "PM";
        if (value % 12) {
          return `${value % 12} ${meridiem}`;
        } else {
          return `12 ${meridiem}`;
        }
      },
    };
    labels = time_frame === "hour" ? labels : { formatter: (value) => value };

    axios
      .get(
        `http://localhost:5000/api/activity/${graphInfo[time_frame].endpoint}`
      )
      .then((res) => {
        const series = [
          { name: "Number of Plays", data: res.data.map((item) => item.plays) },
        ];
        this.setState({
          options: {
            ...this.state.options,
            xaxis: {
              ...this.state.options.xaxis,
              categories: res.data.map((item) => item[time_frame]),
              labels,
            },
            title: {
              ...this.state.options.title,
              text: graphInfo[time_frame].title,
            },
          },
          series,
        });
      });
  };

  changeGraph = async (e) => {
    this.getData(e.target.value);
  };

  render() {
    return (
      <React.Fragment>
        <Chart
          options={this.state.options}
          series={this.state.series}
          type="bar"
          height="450"
          width="80%"
        />
        <input
          type="radio"
          id="day"
          name="bytime"
          value="day"
          onClick={this.changeGraph}
          defaultChecked
        />
        <label for="day">Day of Week</label>
        <br />
        <input
          type="radio"
          id="hour"
          name="bytime"
          value="hour"
          onClick={this.changeGraph}
        />
        <label for="hour">Hour of Day</label>
        <br />
        <input
          type="radio"
          id="month"
          name="bytime"
          value="month"
          onClick={this.changeGraph}
        />
        <label for="month">Month of Year</label>
      </React.Fragment>
    );
  }
}

export default ActivityByTime;
