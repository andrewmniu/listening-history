import React from "react";
import Header from "./components/Header.js";
import History from "./components/History.js";

import "./App.css";

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      albumArtwork: {},
    };
  }

  addArtwork = (notCached, newArtwork) => {
    for(let i = 0; i < Object.keys(notCached).length; i++){
      notCached[Object.keys(notCached)[i]] = newArtwork[i].artwork
    }
    this.setState({albumArtwork: {...this.state.albumArtwork, ...notCached}})
  };

  render() {
    return (
      <div className="App">
        <Header />
        <History
          albumArtwork={this.state.albumArtwork}
          addArtwork={this.addArtwork}
        />
      </div>
    );
  }
}

export default App;
