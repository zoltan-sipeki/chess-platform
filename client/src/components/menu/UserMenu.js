import React, { Component } from 'react';
import LeftClickMenu from './LeftClickMenu';
import User from '../user/User';
import MenuDivider from "./MenuDivider";
import { Link } from "react-router-dom";
import Circle from "./Circle";
import * as STATUS from "../../common/user-statuses.mjs";
import { LINK_PROFILE_PAGE, LINK_SETTINGS_PAGE, ROUTE_SIGN_OUT } from '../../utils/routes';

class UserMenu extends Component {
    onClick = e => {
        this.props.setUserStatus(e.target.textContent);
    }

    signOut = async e => {
        const response = await fetch(ROUTE_SIGN_OUT);
        if (response.ok) {
            this.props.logout();
        }
    }

    render() {
        const { user } = this.props;

        const toggler = (
            <div className="nav-item ms-4">
                <div className="nav-link py-1" role="button">
                    <User avatar={user.avatar} name={user.name} tag={user.tag} status={user.status} statusicon />
                </div>
            </div>
        );

        const menuItems = [
            <Link to={LINK_PROFILE_PAGE(user.id)} className="dropdown-item">Profile page</Link>,
            <Link to={LINK_SETTINGS_PAGE} className="dropdown-item">Settings</Link>,
            <MenuDivider />,
            <button className="dropdown-item d-flex align-items-center" onClick={this.onClick}><Circle color={STATUS.US_ONLINE} className="me-2" />{STATUS.US_ONLINE}</button>,
            <button className="dropdown-item d-flex align-items-center" onClick={this.onClick}><Circle color={STATUS.US_AWAY} className="me-2" />{STATUS.US_AWAY}</button>,
            <button className="dropdown-item d-flex align-items-center" onClick={this.onClick}><Circle color={STATUS.US_OFFLINE} className="me-2" />{STATUS.US_OFFLINE}</button>,
            <MenuDivider />,
            <button className="dropdown-item" onClick={this.signOut}>Sign out</button>
        ];

        return (
            <LeftClickMenu toggler={toggler} menuItems={menuItems} className="end-0" />
        );
    }
}

export default UserMenu;
