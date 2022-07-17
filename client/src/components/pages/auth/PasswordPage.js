import React, { Component } from 'react';
import Form from '../../form/Form';
import FormHeader from '../../form/FormHeader';
import FormInput from '../../form/FormInput';
import FormButton from '../../form/FormButton';
import AuthPage from "./AuthPage";
import { withRouter } from "react-router-dom";
import withLoader from '../../hoc/withLoader';
import withPasswordValidation from '../../hoc/withPasswordValidation';
import * as Strings from "../../../utils/form-strings";
import { ROUTE_PASSWORD } from '../../../utils/routes';

class PasswordPage extends Component {
    handleSubmit =  async e => {
        e.preventDefault();

        const error = this.props.verifyPasswordBeforeSubmit();
        if (error) {
            return;
        }

        this.props.setLoading(true);

        const response = await fetch(ROUTE_PASSWORD(this.props.location.pathname, this.props.location.search), {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=UTF-8"
            },
            body: JSON.stringify({ password: this.props.passwordField, secondPassword: this.props.secondPasswordField })
        });

        this.props.setLoading(false);

        if (response.ok) {
            this.props.resetPasswordForm();
            this.props.showModal(this.props.modalMessage, "/auth/sign-in");
        }
        else {
            const body = await response.text();
            this.props.error(response.status, body);
        }
    }

    render() {
        const {
            buttonText,
            loading,
            passwordField,
            passwordFieldError,
            secondPasswordField,
            verificationError,
            handlePasswordChange,
            handleSecondPasswordChange } = this.props;

        return (
            <Form onSubmit={this.handleSubmit}>
                <FormHeader text="Enter your password" />
                <FormInput type="password" label="Password" value={passwordField} error={passwordFieldError} onChange={handlePasswordChange}
                    help={Strings.PASSWORD_HELP_TEXT}
                    loading={loading}
                    required />
                <FormInput type="password" label="Verify password" value={secondPasswordField} error={verificationError} onChange={handleSecondPasswordChange} loading={loading} required />
                <FormButton title={buttonText} onSubmit={this.handleSubmit} loading={loading} />
            </Form>
        )
    }
}

export default withLoader(withRouter(withPasswordValidation(AuthPage(PasswordPage))));
