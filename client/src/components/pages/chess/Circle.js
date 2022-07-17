import React, { Component } from "react";

class Circle extends Component {
  render() {
    return (
      <div
        className="bg-danger rounded-circle"
        style={{ width: 20, height: 20 }}
      ></div>
    );
  }
}

export default Circle;
