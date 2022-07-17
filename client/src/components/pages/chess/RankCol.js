import React, { Component } from "react";
import Col from "./Col";
import Row from "./Row";

class RankCol extends Component {
  render() {
    const { className } = this.props;

    return (
      <Row className="flex-column">
        <Col className={`text-secondary ${className}`}>8</Col>
        <Col className={`text-secondary ${className}`}>7</Col>
        <Col className={`text-secondary ${className}`}>6</Col>
        <Col className={`text-secondary ${className}`}>5</Col>
        <Col className={`text-secondary ${className}`}>4</Col>
        <Col className={`text-secondary ${className}`}>3</Col>
        <Col className={`text-secondary ${className}`}>2</Col>
        <Col className={`text-secondary ${className}`}>1</Col>
      </Row>
    );
  }
}

export default RankCol;
