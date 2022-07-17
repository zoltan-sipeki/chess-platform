import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { LINK_PROFILE_PAGE } from '../../utils/routes';
import User from "../user/User";

class UserLink extends Component {
    render() {
        const { id, ...rest } = this.props;
        return (
            <Link to={LINK_PROFILE_PAGE(id)} className="text-decoration-none text-reset">
                <User {...rest} />
            </Link>
        );
    }
}

export default UserLink;
