import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTE_SIGN_IN } from '../../../utils/routes';
import Form from '../../form/Form';
import FormButton from '../../form/FormButton';
import FormHeader from '../../form/FormHeader';
import FormInput from '../../form/FormInput';
import AuthPage from "./AuthPage";

class SignInPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: "",
            password: ""
        };
    }

    handleEmailChange = e => {
        this.setState({
            email: e.target.value
        });
    }

    handlePasswordChange = e => {
        this.setState({
            password: e.target.value
        });
    }

    handleSubmit = async e => {
        e.preventDefault();

        const { email, password } = this.state;

        if (!email || !password) {
            this.props.alert("Invalid e-mail address or password.", "danger");
            return;
        }

        this.props.setLoading(true);

        const response = await fetch(ROUTE_SIGN_IN, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        this.props.setLoading(false);

        if (response.ok) {
            this.props.login();
        }
        else if (response.status === 401) {
            const body = await response.json();
            this.props.alert(body.error, "danger");
        }
        else {
            const body = await response.text();
            this.props.error(response.status, body);
        }
    }

    render() {
        const { loading } = this.props;
        const { email, password } = this.state;

        return (
            <Form onSubmit={this.handleSubmit}>
                <FormHeader text="Sign in" />
                <FormInput type="text" label="E-mail address" value={email} loading={loading} onChange={this.handleEmailChange} />
                <FormInput type="password" label="Password" value={password} loading={loading} onChange={this.handlePasswordChange} />
                <FormButton title="Sign in" onSubmit={this.handleSubmit} loading={loading} />
                <p><NavLink to="/auth/forgot-password">Forgot your password?</NavLink></p>
                <p>Don't have an account? <NavLink to="/auth/sign-up">Sign up!</NavLink></p>
            </Form>
        );
    }
}

export default AuthPage(SignInPage);
