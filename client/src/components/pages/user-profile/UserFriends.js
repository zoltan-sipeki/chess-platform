import React, { Component } from "react";
import withPagination from "../../pagination/withPagination";
import { withRouter } from "react-router-dom";
import UserLink from "../../user/UserLink";
import { ROUTE_USER_FRIENDS } from "../../../utils/routes";

const FRIENDS = Object.freeze({
    MUTUAL: "mutual",
    ALL: "all"
});

const SORT = Object.freeze({
    ASCENDING: "A-Z",
    DESCENDING: "Z-A"
});

class UserFriends extends Component {
    constructor(props) {
        super(props);

        this.headers = {
            [FRIENDS.ALL]: "All friends",
            [FRIENDS.MUTUAL]: "Mutual friends"
        };

        this.state = {
            header: this.headers[FRIENDS.ALL],
            user: {},
            displayedFriends: []
        };


        this.friends = [];

        this.selectionFilter = React.createRef();
        this.selectionSort = React.createRef();

        this.sortBy = {
            [SORT.ASCENDING]: (a, b) => {
                if (a.name < b.name) {
                    return -1;
                }

                if (a.name > b.name) {
                    return 1;
                }

                if (a.tag < b.tag) {
                    return -1;
                }

                if (a.tag > b.tag) {
                    return 1;
                }

                return 0;
            },
            [SORT.DESCENDING]: (a, b) => {
                return -1 * this.sortBy[SORT.ASCENDING](a, b);
            }
        };

        this.filters = {
            [FRIENDS.ALL]: (friend) => true,
            [FRIENDS.MUTUAL]: (friend) => friend.mutual
        };
    }

    componentDidMount() {
        this.fetchFriends();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.match.params.id !== prevProps.match.params.id) {
            this.fetchFriends();
        }
    }

    async fetchFriends() {
        const response = await fetch(ROUTE_USER_FRIENDS(this.props.match.params.id));
        const result = await response.json();
        this.props.setNumberOfItems(result.friends.length);
        this.friends = result.friends;
        this.setState({ user: result.user, displayedFriends: this.friends });
    }

    handleSelection = (e) => {
        const selection = this.selectionFilter.current.value;
        const sortBy = this.selectionSort.current.value;

        const displayedFriends = this.friends.filter(friend => this.filters[selection](friend)).sort(this.sortBy[sortBy]);
        this.props.setNumberOfItems(displayedFriends.length);
        this.setState({ displayedFriends, header: this.headers[selection] });
    };

    render() {
        const { header, user, displayedFriends } = this.state;

        return (
            <>
                <h3 className="mb-4 d-flex align-items-center">
                    <UserLink id={user.id} name={user.name} tag={user.tag} avatar={user.avatar} avatarSize={40} />'s friends
                </h3>
                <div className="d-flex justify-content-center">
                    <form className="mb-4 d-flex align-items-center">
                        <div className="me-4">
                            <h5>Filter by:</h5>
                            <select ref={this.selectionFilter} className="me-4" onChange={this.handleSelection}>
                                <option value={FRIENDS.ALL}>{FRIENDS.ALL}</option>
                                <option value={FRIENDS.MUTUAL}>{FRIENDS.MUTUAL}</option>
                            </select>
                        </div>
                        <div className="me-5">
                            <h5>Sort by:</h5>
                            <label className="me-2">Name:</label>
                            <select ref={this.selectionSort} onChange={this.handleSelection}>
                                <option value={SORT.ASCENDING}>{SORT.ASCENDING}</option>
                                <option value={SORT.DESCENDING}>{SORT.DESCENDING}</option>
                            </select>
                        </div>
                    </form>
                </div>
                <h5 className="border-bottom pb-2">{header}</h5>
                <ul className="list-group mb-2">
                    {displayedFriends
                        .map((friend) => (
                            <li
                                key={friend.id}
                                className="list-group-item list-group-item-action"
                            >
                                <UserLink id={friend.id} name={friend.name} tag={friend.tag} avatar={friend.avatar} />
                            </li>
                        ))}
                </ul>
            </>
        );
    }
}

export default withRouter(withPagination(UserFriends));