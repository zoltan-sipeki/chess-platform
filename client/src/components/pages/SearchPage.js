import React, { Component } from 'react';
import withPagination from '../pagination/withPagination';
import { withRouter } from 'react-router-dom';
import UserLink from "../user/UserLink";
import { ROUTE_SEARCH_PAGE } from '../../utils/routes';

const LIMIT = 100;

class SearchPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            searchTerm: "",
            users: []
        };

        this.abort = new AbortController();
    }

    componentDidMount() {
        this.fetchUsers();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.location.search !== this.props.location.search) {
            this.fetchUsers();
        }
    }

    componentWillUnmount() {
        this.abort.abort();
    }

    async fetchUsers() {
        const query = new URLSearchParams(this.props.location.search);

        if (!query.has("name")) {
            return;
        }

        const user = query.get("name");

        try {
            const response = await fetch(ROUTE_SEARCH_PAGE(user, LIMIT), {
                signal: this.abort.signal
            });

            if (!response.ok) {
                this.setState({ users: [] });
                return;
            }

            const users = await response.json();
            const searchTerm = decodeURIComponent(user);
            this.setState({ searchTerm, users });
            this.props.setNumberOfItems(users.length);
        }
        catch (e) {
            if (e.name === "AbortError") {
                return;
            }
        }

    }

    render() {
        const { searchTerm, users } = this.state;

        return (
            <>
                <h3 className="mb-4"><i className="bi bi-search me-1"></i> Search results for "{searchTerm}"</h3>
                <ul className="list-group mb-3">
                    {this.props.showCurrentPage(users, item => (
                        <li key={item.id} className="list-group-item list-group-item-action">
                            <UserLink
                                id={item.id}
                                name={item.name}
                                tag={item.tag}
                                avatar={item.avatar}
                                className="ms-3"
                            />
                        </li>
                    ))}
                </ul>
            </>
        );
    }
}

export default withPagination(withRouter(SearchPage));
