import React from "react";
import PropTypes from "prop-types";
import Chart from "react-apexcharts";
import axios from "axios";
import { subDays, subMonths } from "date-fns";
import moment from "moment";

class ActivityByPeriod extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      options: {
        chart: {
          background: "#ffffff",
          foreColor: "#333",
          zoom: {
            autoScaleYaxis: true,
            enabled: true,
            type: "x",
          },
          toolbar: {
            tools: {
              pan: false,
              reset: false,
              zoomin: false,
            },
          },
          animations: {
            enabled: true,
            easing: "easein",
            speed: 150,
            animateGradually: {
              enabled: false,
            },
            dynamicAnimation: {
              enabled: true,
              speed: 150,
            },
          },
          events: {
            zoomed: this.setMinMax,
          },
        },
        xaxis: {
          categories: [],
        },
        yaxis: {
          min: 0,
          forceNiceScale: true,
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "80%",
            rangeBarOverlap: true,
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

  componentDidMount = () => {
    this.getData();
    const d = new Date();
    console.log(subDays(d, 7).setHours(0, 0, 0, 0));
    console.log(d);
  };

  setMinMax = (chartContext, { xaxis }) => {
    this.setState({
      options: {
        ...this.state.options,
        xaxis: {
          ...this.state.xaxis,
          min: xaxis.min,
          max: xaxis.max,
        },
      },
    });
  };

  getDaily = () => {
    axios.get(`http://localhost:5000/api/activity/daily?desc=false`).then((res) => {
      console.log(res.data);
      const series = [
        { name: "Number of Plays", data: res.data.map((item) => item.plays) },
      ];
      this.setState({
        options: {
          ...this.state.options,
          xaxis: {
            ...this.state.options.xaxis,
            categories: res.data.map((item) => {
              const d = new Date(item.date);
              return d.getTime();
            }),
            type: "datetime",
            min: subDays(new Date(), 7).setHours(12, 0, 0, 0),
            max: new Date().setHours(9, 0, 0, 0),
            labels: {},
          },
          tooltip: {},
          title: {
            ...this.state.options.title,
            text: "Daily",
          },
        },
        series,
      });
    });
  };

  getWeekly = () => {
    axios.get(`http://localhost:5000/api/activity/weekly?desc=false`).then((res) => {
      console.log(res.data);
      const series = [
        { name: "Number of Plays", data: res.data.map((item) => item.plays) },
      ];
      this.setState({
        options: {
          ...this.state.options,
          xaxis: {
            ...this.state.options.xaxis,
            categories: res.data.map((item) => {
              const d = new Date(item.week);
              return d.getTime();
            }),
            type: "numeric",
            min: subMonths(new Date(), 1).setHours(0, 0, 0, 0),
            max: new Date().setHours(0, 0, 0, 0),
            labels: {
              datetimeFormatter: {
                year: "yyyy",
                month: "MMM 'yy",
                day: "dd MMM",
                hour: "HH:mm",
              },
              formatter: function (value, timestamp, index) {
                return moment(new Date(timestamp)).format("DD MMM YYYY");
              },
            },
          },
          tooltip: {
            x: {
              formatter: function (value, index) {
                return moment(new Date(value)).format("MM/DD");
              },
            },
          },
          title: {
            ...this.state.options.title,
            text: "Weekly",
          },
        },
        series,
      });
    });
  };

  getData = (time_frame) => {
    switch(time_frame){
      case "daily":
        this.getDaily();
        break;
      case "weekly":
        this.getWeekly();
        break;
      default:
        this.getDaily();
        break;
    }
  };

  changeRange = (e) => {
    let min, max;
    switch (e.target.id) {
      case "one_week":
        min = subDays(new Date(), 7).setHours(12, 0, 0, 0);
        max = new Date().setHours(0, 0, 0, 0);
        break;
      case "one_month":
        min = subMonths(new Date(), 1).setHours(0, 0, 0, 0);
        max = new Date().setHours(0, 0, 0, 0);
        break;
      case "all_time":
        min = new Date("2019-06-11").setHours(0, 0, 0, 0);
        max = new Date().setHours(0, 0, 0, 0);
        break;
    }
    this.setState({
      options: {
        ...this.state.options,
        xaxis: {
          ...this.state.xaxis,
          min,
          max,
        },
      },
    });
  };

  changeGraph = async (e) => {
    this.getData(e.target.value);
  };

  render() {
    return (
      <React.Fragment>
        <div id="chart" style={{ border: "solid", width: "80vw" }}>
          <div className="toolbar">
            <button
              id="one_week"
              onClick={this.changeRange}
              className={this.state.selection === "one_month" ? "active" : ""}
            >
              1 Week
            </button>
            <button
              id="one_month"
              onClick={this.changeRange}
              className={this.state.selection === "one_month" ? "active" : ""}
            >
              1 Month
            </button>
            <button
              id="all_time"
              onClick={this.changeRange}
              className={this.state.selection === "one_month" ? "active" : ""}
            >
              All Time
            </button>
          </div>
          <div id="chart-timeline">
            <Chart
              options={this.state.options}
              series={this.state.series}
              type="bar"
              height="450"
              width="100%"
            ></Chart>
          </div>
        </div>
        <input
          type="radio"
          id="daily"
          name="byperiod"
          value="daily"
          onClick={this.changeGraph}
          defaultChecked
        />
        <label for="daily">Daily</label>
        <br />
        <input
          type="radio"
          id="weekly"
          name="byperiod"
          value="weekly"
          onClick={this.changeGraph}
        />
        <label for="weekly">Weekly</label>
      </React.Fragment>
    );
  }
}

export default ActivityByPeriod;
