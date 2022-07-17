import React, { Component } from "react";

class Row extends Component {
  render() {
    const { className } = this.props;

    return <div className={`d-flex ${className}`}>{this.props.children}</div>;
  }
}

export default Row;
