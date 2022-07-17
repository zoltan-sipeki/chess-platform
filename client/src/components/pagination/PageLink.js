import React, { Component } from "react";

class PageLink extends Component {
    render() {
        const { active, onClick, children } = this.props;
        const isActive = active === undefined || active;

        return (
            <li className={`page-item ${isActive ? "" : "disabled"}`}>
                <button onClick={onClick} className="page-link">
                    {children}
                </button>
            </li>
        );
    }
}

export default PageLink;