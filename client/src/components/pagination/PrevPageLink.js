import React, { Component } from "react";

class PrevPageLinK extends Component {
  render() {
    const { active, prevPage } = this.props;

    return (
      <li className={`page-item ${active ? "" : "disabled"}`}>
        <button onClick={prevPage} className="page-link">
          &laquo;
        </button>
      </li>
    );
  }
}

export default PrevPageLinK;