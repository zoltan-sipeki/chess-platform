import React, { Component } from 'react';
import PendingUser from '../../user/PendingUser';

class PendingList extends Component {
    render() {
        const { friendRequests, addFriend, removeNotification, removeFriendRequest } = this.props;

        if (friendRequests.length === 0) {
            return (
                <div className="text-center py-3 bg-white border border-light">
                    No friend requests.
                </div>
            );
        }

        return (
            <ul className="list-group">
                {friendRequests.map(request => (
                    <li className="list-group-item list-group-item-action">
                        <PendingUser
                            key={request.sender.id}
                            id={request.sender.id}
                            name={request.sender.name}
                            tag={request.sender.tag}
                            avatar={request.sender.avatar}
                            notification={request}
                            addFriend={addFriend}
                            removeNotification={removeNotification}
                            removeFriendRequest={removeFriendRequest}
                        />
                    </li>
                ))}
            </ul>
        );
    }
}

export default PendingList;
