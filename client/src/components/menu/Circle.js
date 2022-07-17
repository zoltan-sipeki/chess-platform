import React, { Component } from 'react';
import { STATUS_COLOR } from "../../utils/status-colors";

class Circle extends Component {
    render() {
        const { color, className } = this.props;
        return (
            <svg viewBox="0 0 15 15" with="15" height="15" className={className}>
                <circle cx="50%" cy="50%" r="6" fill={STATUS_COLOR[color]} />
            </svg>
        )
    }
}

export default Circle;