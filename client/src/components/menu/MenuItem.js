import React, { Component } from 'react';

export class MenuItem extends Component {
    render() {
        const { children, onClick } = this.props;

        return (
            <li className="dropdown-item" onClick={onClick}>
                {children}
            </li>
        );
    }
}

export default MenuItem;
