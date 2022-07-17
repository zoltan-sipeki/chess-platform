import React, { Component } from 'react';
import { ROUTE_ACCEPT_FRIEND_REQUEST, ROUTE_REJECT_FRIEND_REQUEST } from '../../utils/routes';

function withFriendRequest(WrappedComponent) {
    return class WithFriendRequest extends Component {
        acceptFriendRequest = async () => {
            const { id, sender } = this.props.notification;
            const response = await fetch(ROUTE_ACCEPT_FRIEND_REQUEST(id), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ friendId: sender.id })
            });

            if (response.ok) {
                const body = await response.json();
                this.props.addFriend(body.friend);
                this.props.removeNotification(id);
                this.props.removeFriendRequest(id);
                document.dispatchEvent(new CustomEvent("profile_refresh", { detail: { friendId: sender.id } }));
            }
        }

        rejectFriendRequest = async () => {
            const { id } = this.props.notification;
            const response = await fetch(ROUTE_REJECT_FRIEND_REQUEST(id), {
                method: "POST"
            });

            if (response.ok) {
                this.props.removeNotification(id);
                this.props.removeFriendRequest(id);
            }
        }

        render() {
            return (
                <WrappedComponent
                    {...this.props}
                    acceptFriendRequest={this.acceptFriendRequest}
                    rejectFriendRequest={this.rejectFriendRequest}
                />
            );
        }
    }
}

export default withFriendRequest;

