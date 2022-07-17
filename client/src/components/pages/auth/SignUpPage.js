import React, { Component } from 'react';
import { NavLink } from "react-router-dom";
import Form from "../../form/Form";
import FormInput from '../../form/FormInput';
import FormButton from '../../form/FormButton';
import FormHeader from "../../form/FormHeader";
import AuthPage from "./AuthPage";
import { PROFILE_NAME_INPUT_HELP_TEXT } from "../../../utils/form-strings";
import withNameValidation from '../../hoc/withNameValidation';
import withEmailValidation from '../../hoc/withEmailValidation';
import { ROUTE_SIGN_UP } from '../../../utils/routes';

class SignUpPage extends Component {
    handleSubmit = async e => {
        e.preventDefault();
        const nameError = this.props.verifyNameBeforeSubmit();
        const emailError = this.props.verifyEmailBeforeSubmit();

        if (emailError || nameError) {
            return;
        }

        this.props.setLoading(true);

        const response = await fetch(ROUTE_SIGN_UP, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: this.props.nameField, email: this.props.emailField })
        });

        this.props.setLoading(false);

        if (response.ok) {
            const email = this.props.emailField;
            this.props.resetNameForm();
            this.props.resetEmailForm();

            this.props.showModal((
                <>
                    <p>A verification e-mail has been sent to <strong>{email}</strong>.</p>
                    <p>Follow the instructions in the e-mail to complete your registration.</p>
                    <p>Click on the button below to be redirected back to the home page.</p>
                </>
            ), "/");
        }
        else {
            if (response.status === 400) {
                const body = await response.json();
                this.props.setNameForm({ error: body.name.error });
                this.props.setEmailForm({ error: body.email.error });
            }
            else {
                const body = await response.text();
                this.props.error(response.status, body);
            }
        }
    }

    render() {
        const {
            loading,
            nameField,
            nameFieldError,
            handleNameChange,
            emailField,
            emailFieldError,
            handleEmailChange } = this.props;

        return (
            <Form onSubmit={this.handleSubmit}>
                <FormHeader text="Create an account" />
                <FormInput type="text" label="Profile name" value={nameField} error={nameFieldError} onChange={handleNameChange}
                    help={PROFILE_NAME_INPUT_HELP_TEXT}
                    loading={loading}
                    required />
                <FormInput type="text" label="E-mail address" value={emailField} error={emailFieldError} loading={loading} onChange={handleEmailChange} required />
                <FormButton title="Sign up" onSubmit={this.handleSubmit} loading={loading} />
                <p className="mt-2">Already have an account? <NavLink to="/auth/sign-in">Sign in!</NavLink></p>
            </Form>
        );
    }
}

export default withNameValidation(withEmailValidation(AuthPage(SignUpPage)));
