import React, { Component } from 'react';
import { ROUTE_REMOVE_NOTIFICATION } from '../../utils/routes';
import { toAgoString } from '../../utils/time';

class Notification extends Component {
    static style = {
        minWith: 300
    }

    static dateFontSize = {
        fontSize: 12
    };

    onClick = async e => {
        const response = await fetch(ROUTE_REMOVE_NOTIFICATION(this.props.notification.id), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ notificationId: this.props.notification.id })
        });

        if (response.ok) {
            this.props.onClose(this.props.notification.id);
        }
    }

    render() {
        const { body, footer, notification } = this.props;

        return (
            <div style={Notification.style} className="text-nowrap notification">
                <div className="d-flex align-items-center justify-content-between">
                    <div className="me-5">
                        {body}
                    </div>
                    <button className="btn-close" onClick={this.onClick}></button>
                </div>
                <div className="mt-1 mb-1 text-secondary fw-bold" style={Notification.dateFontSize}>
                    {toAgoString(new Date(notification.createdAt))}
                </div>
                {footer}
            </div>
        )
    }
}

export default Notification;
