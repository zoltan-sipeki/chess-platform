import React, { Component } from "react";

class PaginationLink extends Component {
  render() {
    const { currentPage, setCurrentPage, nth } = this.props;
    return (
      <li className={`page-item ${currentPage === nth ? "active" : ""}`}>
        <button onClick={() => setCurrentPage(nth)} className="page-link">
          {nth + 1}
        </button>
      </li>
    );
  }
}

export default PaginationLink;