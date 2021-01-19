import React from 'react'
import PropTypes from 'prop-types'

class FavoriteButtons extends React.Component {
  render () {
    return (
      <div className="btn-group control" data-toggle="buttons">
        <button
          className={`btn-primary ${ 'Tracks' === this.props.item ? 'active' : ''}`}
          onClick={this.props.changeItemType}
          value="Tracks"
          id="tracks"
        >
          <input className="favorite-selection" type="radio" name="options" defaultChecked/>
        </button>
        <button
          className={`btn-primary ${ 'Artists' === this.props.item ? 'active' : ''}`}
          onClick={this.props.changeItemType}
          value="Artists"
          id="artists"
        >
          <input className="favorite-selection" type="radio" name="options"/>
        </button>
        <button
          className={`btn-primary ${ 'Albums' === this.props.item ? 'active' : ''}`}
          onClick={this.props.changeItemType}
          value="Albums"
          id="albums"
        >
          <input className="favorite-selection" type="radio" name="options"/>
        </button>
      </div>
    )
  }
}

export default FavoriteButtons;
