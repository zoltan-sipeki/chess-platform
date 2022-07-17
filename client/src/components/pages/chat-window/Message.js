import React, { Component } from 'react';

class Message extends Component {
    static timeFontSize = {
        fontSize: "11px"
    };

    static padWithZeros(number) {
        if (number < 10) {
            return "0" + number;
        }

        return number.toString();
    }

    render() {
        const { message } = this.props;
        const createdAt = new Date(message.createdAt);

        return (
            <div className="d-flex align-items-center message py-1">
                <div className="me-2 text-muted time-stamp" style={Message.timeFontSize}>{Message.padWithZeros(createdAt.getHours()) + ":" + Message.padWithZeros(createdAt.getMinutes())}</div>
                <div style={{ whiteSpace: "breaks-spaces", wordBreak: "break-word" }}>{message.text}</div>
            </div>
        );
    }
}

export default Message;
