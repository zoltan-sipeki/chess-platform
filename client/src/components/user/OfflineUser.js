import React, { Component } from 'react';
import User from './User';
import RightClickMenu from "../menu/RightClickMenu";
import MenuDivider from '../menu/MenuDivider';
import { US_OFFLINE } from "../../common/user-statuses.mjs";
import { Link } from "react-router-dom";
import { LINK_CHAT_WINDOW, LINK_PROFILE_PAGE } from '../../utils/routes';

class OfflineUser extends Component {
    unfriend = e => {
        this.props.unfriend(this.props.id);
    }

    render() {
        const { id, chatroomId, statusText, unfriend, ...rest } = this.props;
        const toggler = (
            <User {...rest} status={US_OFFLINE} statusicon statustext={statusText} tagonhover />
        );

        const menuItems = [
            <Link to={LINK_PROFILE_PAGE(id)} className="dropdown-item">
                View profile
            </Link>,
            <Link to={LINK_CHAT_WINDOW(chatroomId)} className="dropdown-item">
                Send message
            </Link>,
            <MenuDivider />,
            <button onClick={this.unfriend} className="dropdown-item">
                Unfriend
            </button>
        ];

        return (
            <li className="list-group-item list-group-item action">
                <RightClickMenu toggler={toggler} menuItems={menuItems} dropdownCaret />
            </li>
        );
    }
}

export default OfflineUser;