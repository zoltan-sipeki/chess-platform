import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { LINK_FRIENDS_PAGE } from '../../../utils/routes';
import UserLink from '../../user/UserLink';

export class Friends extends Component {
    render() {
        const { friends, userId } = this.props;

        let list = [];
        let belowList = null;

        if (friends.length === 0) {
            belowList = (<div className="text-center">No friends</div>);
        }
        else {
            list = friends.map(friend => (
                <li key={friend.id} className="list-group-item list-group-item-action">
                    <UserLink id={friend.id} name={friend.name} tag={friend.tag} avatar={friend.avatar} tagonhover />
                </li>
            ));

            belowList = (
                <Link to={LINK_FRIENDS_PAGE(userId)} className="btn btn-outline-primary mt-1 d-block w-100">
                    Show more
                </Link>
            );
        }

        return (
            <div className="w-100 mt-2 mt-xl-0">
                <h4 className="border-bottom pb-2 border-secondary px-2 py-2 mb-0">
                    Friends
                </h4>
                <ul className="list-group">
                    {list}
                </ul>
                {belowList}
            </div>
        );
    }
}

export default Friends;
