import React, { Component } from "react";

class Col extends Component {
  static sizeStyle = {
    width: 45,
    height: 45
  };

  render() {
    const { className } = this.props;

    return (
      <div
        className={`d-flex justify-content-center align-items-center ${className}`}
        style={Col.sizeStyle}
      >
        {this.props.children}
      </div>
    );
  }
}

export default Col;
