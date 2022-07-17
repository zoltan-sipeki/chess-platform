import React, { Component } from "react";
import Square from "./Square";

class WhiteSquare extends Component {
  render() {
    return <Square className="border border-dark bg-white" />;
  }
}

export default WhiteSquare;
