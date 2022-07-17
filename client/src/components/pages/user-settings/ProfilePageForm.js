import React, { Component } from 'react';
import { ROUTE_CHANGE_PROFILE_PAGE } from '../../../utils/routes';
import { GENERIC_ERROR } from '../../../utils/form-strings';
import Spinner from '../../Spinner';
import withLoader from "../../hoc/withLoader";

export class ProfilePageForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: this.props.visibility
        };

        this.map = {
            "public": "everyone",
            "friends only": "only you and your friends",
            "private": "only you"
        };

        this.index = {
            "public": 0,
            "friends only": 1,
            "private": 2
        };

        this.selectRef = React.createRef();
    }

    componentDidMount() {
        this.selectRef.current.selectedIndex = this.index[this.props.visibility];
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.visibility !== this.props.visibility && prevProps.visibility == null) {
            this.setState({ value: this.props.visibility });
        }

        if (prevState.value !== this.state.value) {
            this.selectRef.current.selectedIndex = this.index[this.state.value];
        }
    }

    handleSelect = e => {
        this.setState({ value: e.target.value });
    }

    handleSubmit = async e => {
        e.preventDefault();

        try {
            this.props.setLoading(true);
            const response = await fetch(ROUTE_CHANGE_PROFILE_PAGE, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ profilePage: this.state.value })
            });
            this.props.setLoading(false);

            if (response.ok) {
                const body = await response.json();
                this.props.setUser({ profilePage: body.profilePage });
                this.props.showAlert(<>Now <strong>{this.map[body.profilePage]}</strong> can see your profile page.</>, "success");
            }
            else {
                console.log(this.state);
                this.props.showAlert(GENERIC_ERROR, "danger");
            }
        }
        catch (err) {

        }
    }

    render() {
        const { loading } = this.props;

        return (
            <form className="row row-cols-lg mt-3">
                <div className="col">
                    <select ref={this.selectRef} className="form-select" onChange={this.handleSelect} disabled={loading} >
                        <option value="public">Everyone</option>
                        <option value="friends only">Friends only</option>
                        <option value="private">Only me</option>
                    </select>
                </div>
                <div className="col">
                    <div className="d-flex justify-content-end">
                        <button onClick={this.handleSubmit} type="submit" className="btn btn-secondary" disabled={loading}>
                            {loading ? <Spinner /> : "Change"}
                        </button>
                    </div>
                </div>
            </form>
        );
    }
}

export default withLoader(ProfilePageForm);
