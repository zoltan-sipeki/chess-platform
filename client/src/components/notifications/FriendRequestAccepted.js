import React, { Component } from 'react';
import Notification from './Notification';
import User from '../user/User';

export class FriendRequestAccepted extends Component {
    render() {
        const { notification, removeNotification } = this.props;
        const { sender } = notification;
        const body = (
            <>
                <User name={sender.name} tag={sender.tag} avatar={sender.avatar} />
                and you are now friends!
            </>
        );
        return (
            <Notification body={body} notification={notification} onClose={removeNotification} />
        );
    }
}

export default FriendRequestAccepted;
