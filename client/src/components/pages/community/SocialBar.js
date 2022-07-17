/* eslint-disable default-case */
import React, { Component } from 'react';
import Tab from './SocialTab';

const FRIEND_LIST = 0;
const PENDING_LIST = 1;

class SocialBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            active: FRIEND_LIST,
            friends: [],
            friendRequests: [],
            searchTerm: ""
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.friends !== this.props.friends) {
            this.setState({ friends: this.props.friends });
        }

        if (prevProps.friendRequests !== this.props.friendRequests) {
            this.setState({ friendRequests: this.props.friendRequests });
        }
    }

    handleSearchInput = e => {
        const searchTerm = e.target.value;

        const friends = this.props.friends.filter(friend => friend.name.toLowerCase().includes(searchTerm.toLowerCase()));
        const friendRequests = this.props.friendRequests.filter(request => request.senderName.toLowerCase().includes(searchTerm.toLowerCase()));

        this.setState({ searchTerm, friends, friendRequests });
    }

    showFriendList = e => {
        this.setState({
            active: FRIEND_LIST
        });
    }

    showPendingList = e => {
        this.setState({
            active: PENDING_LIST
        });
    }

    render() {
        const { active, searchTerm, friends, friendRequests } = this.state;

        let list = null;

        switch (active) {
            case FRIEND_LIST:
                list = this.props.friendList(friends);
                break;

            case PENDING_LIST:
                list = this.props.pendingList(friendRequests);
                break;
        }

        return (
            <div className="social">
                <h6 className="mb-0 py-2 text-center bg-secondary text-light" >Friends & friend requests</h6>
                <ul className="nav nav-tabs nav-fill">
                    <Tab text="Friends" active={active === FRIEND_LIST} onClick={this.showFriendList} />
                    <Tab text="Requests" active={active === PENDING_LIST} onClick={this.showPendingList} />
                </ul>
                <div className="position-relative">
                    <i className="bi bi-search position-absolute top-50 end-0 translate-middle text-muted"></i>
                    <input
                        onChange={this.handleSearchInput}
                        value={searchTerm}
                        className="form-control my-1"
                        type="text"
                        placeholder="Search"
                        style={{ paddingRight: "30px" }}
                    />
                </div>
                {list}
            </div>
        );
    }
}

export default SocialBar;
