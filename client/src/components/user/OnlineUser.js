import React, { Component } from 'react';
import User from './User';
import RightClickMenu from "../menu/RightClickMenu";
import MenuDivider from '../menu/MenuDivider';
import { Link } from "react-router-dom";
import { LINK_CHAT_WINDOW, LINK_PROFILE_PAGE } from '../../utils/routes';

class OnlineUser extends Component {
    inviteFriend = e => {
        this.props.inviteFriendToPlay(this.props.id);
    }

    unfriend = e => {
        this.props.unfriend(this.props.id);
    }

    render() {
        const { id, chatroomId, unfriend, status, statusText, ...rest } = this.props;
        const toggler = (
            <User {...rest} statusicon status={status} statustext={statusText} tagonhover />
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
            </button>,
            <MenuDivider />,
            <button className="dropdown-item" onClick={this.inviteFriend}>
                Invite to play
            </button>
        ];

        return (
            <li className="list-group-item list-group-item action">
                <RightClickMenu toggler={toggler} menuItems={menuItems} dropdownCaret />
            </li>
        );
    }
}

export default OnlineUser;