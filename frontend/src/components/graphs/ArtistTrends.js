import React from "react";
import PropTypes from "prop-types";
import Chart from "react-apexcharts";
import ApexCharts from "apexcharts";
import axios from "axios";
import { subDays, subMonths } from "date-fns";
import moment from "moment";

class ArtistTrends extends React.Component {
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
          title: {
            text: "Tracks Played per Week"
          },
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
        colors: [
          "#000000",
          "#FFFF00",
          "#1CE6FF",
          "#FF34FF",
          "#FF4A46",
          "#008941",
          "#006FA6",
          "#A30059",
          "#7A4900",
          "#0000A6",
          "#63FFAC",
          "#B79762",
          "#004D43",
          "#8FB0FF",
          "#997D87",
          "#5A0007",
          "#809693",
          "#1B4400",
          "#4FC601",
          "#3B5DFF",
          "#4A3B53",
          "#FF2F80",
          "#61615A",
          "#BA0900",
          "#6B7900",
          "#00C2A0",
          "#FFAA92",
          "#FF90C9",
          "#B903AA",
          "#D16100",
          "#DDEFFF",
          "#000035",
          "#7B4F4B",
          "#A1C299",
          "#300018",
          "#0AA6D8",
          "#013349",
          "#00846F",
          "#372101",
          "#FFB500",
          "#C2FFED",
          "#A079BF",
          "#CC0744",
          "#C0B9B2",
          "#C2FF99",
          "#001E09",
          "#00489C",
          "#6F0062",
          "#0CBD66",
          "#EEC3FF",
          "#456D75",
          "#B77B68",
          "#7A87A1",
          "#788D66",
          "#885578",
          "#FAD09F",
          "#FF8A9A",
          "#D157A0",
          "#BEC459",
          "#456648",
          "#0086ED",
          "#886F4C",
          "#34362D",
          "#B4A8BD",
          "#00A6AA",
          "#452C2C",
          "#636375",
          "#A3C8C9",
          "#FF913F",
          "#938A81",
          "#575329",
          "#00FECF",
          "#B05B6F",
          "#8CD0FF",
          "#3B9700",
          "#04F757",
          "#C8A1A1",
          "#1E6E00",
          "#7900D7",
          "#A77500",
          "#6367A9",
          "#A05837",
          "#6B002C",
          "#772600",
          "#D790FF",
          "#9B9700",
          "#549E79",
          "#FFF69F",
          "#201625",
          "#72418F",
          "#BC23FF",
          "#99ADC0",
          "#3A2465",
          "#922329",
          "#5B4534",
          "#FDE8DC",
          "#404E55",
          "#0089A3",
          "#CB7E98",
          "#A4E804",
          "#324E72",
          "#6A3A4C",
        ],
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

  getData = async () => {
    let artists;
    let hidden;
    await axios
      .get("http://localhost:5000/api/artist-trends/artists")
      .then((res) => {
        artists = res.data.trending.join(",");
        hidden = res.data.hidden;
      });

    axios
      .get("http://localhost:5000/api/artist-trends/trends", {
        params: { artists },
      })
      .then((res) => {
        const series = res.data.map((artist) => {
          let d = artist.activity.map((item) => {
            return { x: item.week, y: item.plays };
          });
          return { name: artist.name, data: d };
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
        for (let artist of hidden) {
          ApexCharts.exec("artist-trends", "hideSeries", artist);
        }
      });
  };

  render() {
    return (
      <div id="chart">
        <Chart
          options={this.state.options}
          series={this.state.series}
          height={500}
          type="line"
        />
      </div>
    );
  }
}

export default ArtistTrends;
