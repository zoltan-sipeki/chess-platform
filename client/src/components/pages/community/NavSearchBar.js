import React, { Component, Fragment } from 'react';
import { Redirect, withRouter, Link } from "react-router-dom";
import MenuDivider from '../../menu/MenuDivider';
import withMenu from '../../menu/withMenu';
import UserLink from '../../user/UserLink';
import { LINK_SEARCH_PAGE, ROUTE_SEARCH_PAGE } from '../../../utils/routes';

const TYPING_DELAY = 250;
const USER_LIMIT = 4;

class NavSearchBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: "",
            users: [],
            redirected: false,
            searchTerm: ""
        };

        this.delayTimeout = -1;
        this.controller = new AbortController();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.users !== this.state.users) {
            this.props.show();
        }

        if (prevState.inputValue !== this.state.inputValue) {
            if (this.state.inputValue.length === 0) {
                this.props.close();
            }
        }
    }

    componentWillUnmount() {
        clearTimeout(this.delayTimeout);
        this.controller.abort();
    }

    clearInput = () => {
        this.setState({ inputValue: "", users: [] });
        this.props.close();
    }

    onSubmit = e => {
        e.preventDefault();
        const { inputValue } = this.state;

        if (inputValue.length === 0) {
            return;
        }

        this.setState({ redirected: true, searchTerm: this.state.inputValue });
        this.clearInput();
    }

    onClick = e => {
        const { inputValue } = this.state;
        if (inputValue.length > 0) {
            this.props.show(e);
        }
    }

    handleChange = e => {
        clearTimeout(this.delayTimeout);
        const inputValue = e.target.value;
        this.setState({ inputValue });
        this.delayTimeout = setTimeout(() => this.fetchUsers(), TYPING_DELAY);
    }

    async fetchUsers() {
        const { inputValue } = this.state;

        if (inputValue.length === 0) {
            return;
        }

        try {
            const response = await fetch(ROUTE_SEARCH_PAGE(inputValue, USER_LIMIT), {
                signal: this.controller.signal
            });
            const users = await response.json();
            this.setState({ users });
        }
        catch (e) {
            if (e.name === "AbortError") {
                return;
            }
        }
    }

    renderUserList() {
        const { users, inputValue } = this.state;
        const result = [];

        if (users.length === 0 && inputValue.length > 0) {
            result.push(
                <li>
                    <span className="dropdown-item">
                        <i className="bi bi-x-circle-fill text-danger pe-2"></i> No such user found.
                    </span>
                </li>
            );
            return result;
        }

        
        for (let i = 0; i < USER_LIMIT && i < users.length; ++i) {
            result.push(
                <li key={users[i].id}>
                    <UserLink
                        id={users[i].id}
                        name={users[i].name}
                        tag={users[i].tag}
                        avatar={users[i].avatar}
                        className="dropdown-item"
                    />
                </li>
            );
        }

        if (users.length === USER_LIMIT) {
            result.push(
                <li key={-1} className="text-center">
                    <MenuDivider />
                    <Link to={LINK_SEARCH_PAGE(inputValue)} onClick={this.clearInput} className="dropdown-item">
                        Show more
                    </Link>
                </li>
            );
        }

        return result;
    }

    render() {
        const { menuShown, menuRef, close } = this.props;
        const { inputValue, redirected, searchTerm } = this.state;

        let redirect = null;
        if (redirected) {
            redirect = <Redirect to={LINK_SEARCH_PAGE(encodeURIComponent(searchTerm))} />;
        }

        const userList = this.renderUserList();
        let list = null;
        if (userList.length > 0) {
            list = (
                <ul className={`${menuShown ? "d-block" : "d-none"} dropdown-menu w-100 top-100 d-grid gap-1 shadow`} onClick={close}>
                    {userList}
                </ul>
            );
        }

        return (
            <>
                {redirect}
                <form ref={menuRef} className="d-flex me-5 dropdown" onSubmit={this.onSubmit} >
                    <input className="form-control me-2" placeholder="Search for user" onChange={this.handleChange} value={inputValue} onClick={this.onClick} />
                    <Link to={LINK_SEARCH_PAGE(inputValue)} onClick={this.clearInput} className="btn btn-success">
                        <i className="bi bi-search"></i>
                    </Link>
                    {list}
                </form>
            </>
        );
    }
}

export default withRouter(withMenu(NavSearchBar));
