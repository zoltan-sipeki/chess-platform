import React, { Component } from 'react';

export class Tab extends Component {
    render() {
        const { active, text, onClick } = this.props;
        return (
            <li className={`nav-item nav-link px-2 py-1 position-relative ${active ? "active" : ""}`} role="button" onClick={onClick}>
                {text}
            </li>
        );
    }
}

export default Tab;