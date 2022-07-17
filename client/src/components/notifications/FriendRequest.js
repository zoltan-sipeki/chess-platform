import React, { Component } from 'react';
import User from "../user/User";
import withFriendRequest from './withFriendRequest';
import Notification from './Notification';

class FriendRequest extends Component {
    render() {
        const { notification, removeNotification, acceptFriendRequest, rejectFriendRequest } = this.props;
        const { sender } = notification;
        const body = (
            <>
                <User name={sender.name} tag={sender.tag} avatar={sender.avatar} />
                has sent you a friend request.
            </>
        );

        const footer = (
            <div className="d-flex justify-content-center mt-2 mb-1">
                <button className="btn btn-primary me-4" onClick={acceptFriendRequest}>Accept</button>
                <button className="btn btn-secondary" onClick={rejectFriendRequest}>Reject</button>
            </div>
        );

        return (
            <Notification body={body} footer={footer} onClose={removeNotification} notification={notification} />
        );
    }
}

export default withFriendRequest(FriendRequest);
