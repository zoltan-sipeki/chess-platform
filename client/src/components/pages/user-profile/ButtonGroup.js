import React, { Component } from 'react'
import { Link } from "react-router-dom";
import { US_OFFLINE } from '../../../common/user-statuses.mjs';
import { LINK_CHAT_WINDOW, ROUTE_USER_FRIEND_REQUESTS } from '../../../utils/routes';

class ButtonGroup extends Component {
    constructor(props) {
      super(props);
    
      this.state = {
         friendRequestSent: false
      };
    };

    sendFriendRequest = async e => {
        await fetch(ROUTE_USER_FRIEND_REQUESTS(this.props.userId), {
            method: "POST"
        });
        this.setState({ friendRequestSent: true });
    }

    unfriend = e => {
        this.props.unfriend(this.props.userId);
    }

    inviteFriendToPlay = e => {
        this.props.inviteFriendToPlay(this.props.userId);
    }

    render() {
        const { relation, chatroomId, status } = this.props;
        const { friendRequestSent } = this.state;

        if (relation === "self") {
            return null;
        }

        const buttons = [];
        if (relation === "stranger") {
            const buttonText = friendRequestSent ? "Friend request sent" : "Add friend";
            const disabled = friendRequestSent;
            buttons.push(<button key={-1} className="btn btn-secondary mb-1" onClick={this.sendFriendRequest} disabled={disabled}>{buttonText}</button>);
        }

        if (relation === "friend") {
            buttons.push(<Link key={-2} to={LINK_CHAT_WINDOW(chatroomId)} className="btn btn-secondary mb-1">Send message</Link>);
            if (status !== US_OFFLINE) {
                buttons.push(<button key={-3} onClick={this.inviteFriendToPlay} className="btn btn-secondary mb-1">Invite to play</button>);
            }
            buttons.push(<button key={-4} onClick={this.unfriend} className="btn btn-danger mb-1">Unfriend</button>);
        }

        return (
            <div className="d-flex flex-column mt-3 mt-md-0">
                {buttons}
            </div>
        );
    }
}

export default ButtonGroup;
