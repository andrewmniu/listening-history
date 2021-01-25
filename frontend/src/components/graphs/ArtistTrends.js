import React from "react";
import PropTypes from "prop-types";
import Chart from "react-apexcharts";
import ApexCharts from "apexcharts";
import axios from "axios";
import { subDays, subMonths } from "date-fns";
import moment from "moment";

class ApexChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      options: {
        type: "line",
        stroke: {
          curve: "smooth",
        },
        chart: {
          id: "artist-trends",
          background: "#ffffff",
          foreColor: "#333",
          zoom: {
            autoScaleYaxis: true,
            enabled: true,
            type: "x",
          },

          toolbar: {
            tools: {
              pan: true,
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
        },
        xaxis: {
          type: "datetime",
        },
        yaxis: {
          min: 0,
          forceNiceScale: true,
        },
        tooltip: {
          theme: "dark",
          onDatasetHover: {
            highlightDataSeries: false,
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
    this.getData();
  }

  getData = () => {
    // const artists = [
    //   "Adrianne Lenker",
    //   "Laura Stevenson",
    //   "The Avett Brothers",
    //   "Kanye West",
    // ].join(",");
    const artists = ["Joni Mitchell", 'Francoise Hardy', 'Kacey Musgraves'].join(",");

    axios
      .get("http://localhost:5000/api/artists/by-artist", {
        params: { artists },
      })
      .then((res) => {
        const series = res.data.map((artist) => {
          let d = artist.artist_history.map((item) => {
            return { x: item.week, y: item.plays };
          });
          return { name: artist.artist, data: d };
        });
        this.setState({
          options: {
            ...this.state.options,
            title: {
              ...this.state.options.title,
              text: "Artist Trends",
            },
            xaxis: {
              ...this.state.options.xaxis,
              min: subMonths(new Date(), 6).setHours(0, 0, 0, 0),
            },
          },
          series,
        });
      })
      .then(() => {
        // const exclude = ['Kanye West', 'The Avett Brothers'];
        // for (let artist of exclude){
        //
        //   ApexCharts.exec("artist-trends", "hideSeries", artist);
        // }
      });
  };

  render() {
    return (
      <div id="chart">
        <Chart
          options={this.state.options}
          series={this.state.series}
          height={350}
          type="line"
        />
      </div>
    );
  }
}

export default ApexChart;
