import React, { Component } from "react";
import Col from "./Col";
import Row from "./Row";

class FileRow extends Component {
  render() {
    const { className } = this.props;

    return (
      <Row>
        <Col />
        <Col className={`text-secondary ${className}`}>a</Col>
        <Col className={`text-secondary ${className}`}>b</Col>
        <Col className={`text-secondary ${className}`}>c</Col>
        <Col className={`text-secondary ${className}`}>d</Col>
        <Col className={`text-secondary ${className}`}>e</Col>
        <Col className={`text-secondary ${className}`}>f</Col>
        <Col className={`text-secondary ${className}`}>g</Col>
        <Col className={`text-secondary ${className}`}>h</Col>
        <Col />
      </Row>
    );
  }
}

export default FileRow;
