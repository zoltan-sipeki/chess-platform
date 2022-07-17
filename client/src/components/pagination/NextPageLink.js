import React, { Component } from "react";

class NextPageLink extends Component {
  render() {
    const { active, nextPage } = this.props;
    return (
      <li className={`page-item ${active ? "" : "disabled"}`}>
        <button onClick={nextPage} className="page-link" href="#">
          &raquo;
        </button>
      </li>
    );
  }
}

export default NextPageLink;