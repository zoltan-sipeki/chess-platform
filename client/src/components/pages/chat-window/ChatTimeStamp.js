import React, { Component } from 'react';
import { stringifyDate } from '../../../utils/time';

class ChatTimeStamp extends Component {
    render() {
        const { date } = this.props;

        return (
            <div className="text-muted text-center mb-1" style={{ fontSize: 12 }}>
                {stringifyDate(new Date(date))}
            </div>
        );
    }
}

export default ChatTimeStamp;