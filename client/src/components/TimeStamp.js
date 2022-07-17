import React, { Component } from 'react'
import { MSToTimeStamp } from '../utils/time';

export class TimeStamp extends Component {
    render() {
        const { time, className } = this.props;

        return (
            <div
                className={`d-flex align-items-center justify-content-center ${className}`}
            >
                {MSToTimeStamp(time)}
            </div>
        )
    }
}

export default TimeStamp
