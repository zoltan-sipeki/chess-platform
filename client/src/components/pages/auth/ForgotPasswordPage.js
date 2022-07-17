import React, { Component } from 'react';
import { InputState, validateEmail } from '../../../common/validators';
import FormButton from '../../form/FormButton';
import FormInput from '../../form/FormInput';
import Form from "../../form/Form";
import FormHeader from '../../form/FormHeader';
import AuthPage from "./AuthPage";
import { ROUTE_FORGOT_PASSWORD } from '../../../utils/routes';

class ForgotPasswordPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: new InputState()
        };
    }

    handleEmailChange = e => {
        const email = e.target.value;
        const error = validateEmail(email);
        this.setState({
            email: new InputState(email, error)
        });
    }

    handleSubmit = async e => {
        e.preventDefault();

        const email = InputState.copy(this.state.email);
        email.error = validateEmail(email.value);

        if (email.error) {
            this.setState({
                email: email
            });

            return;
        }

        this.props.setLoading(true);

        const response = await fetch(ROUTE_FORGOT_PASSWORD, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=UTF-8"
            },
            body: JSON.stringify({ email: email.value })
        });

        this.props.setLoading(false);

        if (response.ok) {
            this.setState({
                email: new InputState()
            });

            this.props.showModal((
                <span>
                    <p>A password reset link has been sent to <strong>{email.value}</strong>.</p>
                    <p>Follow the instructions in the e-mail to change your password.</p>
                    <p>Click on the button below to be redirected back to the home page.</p>
                </span>
            ), "/");
        }
        else {
            const body = await response.text();
            this.props.error(response.status, body);
        }
    }

    render() {
        const { loading } = this.props;
        const { email } = this.state;

        return (
            <Form onSubmit={this.handleSubmit}>
                <FormHeader text="Reset your password" />
                <FormInput type="text" label="Enter your e-mail address" value={email.value} error={email.error} onChange={this.handleEmailChange} loading={loading} required />
                <FormButton title="Send password reset link" onSubmit={this.handleSubmit} loading={loading} />
            </Form>
        )
    };
}

export default AuthPage(ForgotPasswordPage);
