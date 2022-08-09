import React, { Component } from 'react';
import FormInput from '../../form/FormInput';
import FormButton from '../../form/FormButton';
import withLoader from '../../hoc/withLoader';
import ModalHeader from '../../modal/ModalHeader';
import ModalBody from '../../modal/ModalBody';
import withEmailValidation from '../../hoc/withEmailValidation';
import withCurrentPassword from '../../hoc/withCurrentPassword';
import { GENERIC_ERROR } from '../../../utils/form-strings';
import { ROUTE_CHANGE_EMAIL } from '../../../utils/routes';

export class EmailForm extends Component {
    handleSubmit = async e => {
        e.preventDefault();

        const emailError = this.props.verifyEmailBeforeSubmit();
        const passwordError = this.props.checkIfCurrentPasswordIsEmpty();

        if (emailError || passwordError) {
            return;
        }

        if (this.props.email === this.props.emailField) {
            this.props.setEmailForm({ error: "Your e-mail is the same. " });
            return;
        }

        this.props.setLoading(true);
        const response = await fetch(ROUTE_CHANGE_EMAIL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: this.props.emailField, currentPassword: this.props.currentPassword })
        });
        this.props.setLoading(false);

        if (response.ok) {
            const { email } = await response.json();
            this.props.setUser({ email })
            this.props.closeModal();
            this.props.showAlert(<span>Your e-mail has been succesfully changed to <strong>{email}</strong></span>, "success");
        }
        else {
            const body = await response.json();
            if (response.status === 400) {
                this.props.setEmailForm({ error: body.error });
            }
            else if (response.status === 401) {
                this.props.setCurrentPasswordForm({ error: body.error });
            }
            else {
                this.props.showAlert(GENERIC_ERROR, "danger");
                this.props.closeModal();
            }
        }
    }

    render() {
        const {
            loading,
            handleEmailChange,
            emailField,
            emailFieldError,
            currentPassword,
            currentPasswordError,
            handleCurrentPasswordChange
        } = this.props;

        return (
            <>
                <ModalHeader closeButton>
                    Enter your new your email
                </ModalHeader>
                <ModalBody>
                    <form className="mx-4" onSubmit={this.handleSubmit}>
                        <FormInput
                            label="New email address"
                            value={emailField}
                            error={emailFieldError}
                            onChange={handleEmailChange}
                            loading={loading}
                        />
                        <FormInput
                            label="Current password"
                            type="password"
                            value={currentPassword}
                            error={currentPasswordError}
                            onChange={handleCurrentPasswordChange}
                            loading={loading}
                        />
                        <FormButton
                            title="Submit"
                            loading={loading}
                            centered
                            onSubmit={this.handleSubmit}
                        />
                    </form>
                </ModalBody>
            </>
        );
    }
}

export default withCurrentPassword(withEmailValidation(withLoader(EmailForm)));
