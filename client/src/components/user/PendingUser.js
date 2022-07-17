import React, { Component } from 'react';
import RightClickMenu from "../menu/RightClickMenu";
import MenuDivider from '../menu/MenuDivider';
import User from './User';
import withFriendRequest from '../notifications/withFriendRequest';
import { Link } from "react-router-dom";
import { LINK_PROFILE_PAGE } from '../../utils/routes';

class PendingUser extends Component {
    render() {
        const { acceptFriendRequest, rejectFriendRequest, id, ...rest } = this.props;
        const toggler = (
            <User {...rest} tagonhover />
        );

        const menuItems = [
            <Link to={LINK_PROFILE_PAGE(id)} className="dropdown-item">
                View profile
            </Link>,
            <MenuDivider />,
            <button className="dropdown-item" onClick={acceptFriendRequest}>
                Accept
            </button>,
            <button className="dropdown-item" onClick={rejectFriendRequest}>
                Reject
            </button>
        ];

        return (
            <RightClickMenu toggler={toggler} menuItems={menuItems} dropdownCaret />
        );
    }
}

export default withFriendRequest(PendingUser);
