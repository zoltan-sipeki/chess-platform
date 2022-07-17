import React, { Component } from "react";
import Square from "./Square";

class BlackSquare extends Component {
  render() {
    return <Square className="border border-dark bg-dark" />;
  }
}

export default BlackSquare;
