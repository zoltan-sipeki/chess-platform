import React, { Component } from 'react';
import FormInput from '../../form/FormInput';
import FormButton from '../../form/FormButton';
import ModalHeader from '../../modal/ModalHeader';
import ModalBody from '../../modal/ModalBody';
import withCurrentPassword from '../../hoc/withCurrentPassword';
import withPasswordValidation from '../../hoc/withPasswordValidation';
import withLoader from '../../hoc/withLoader';
import { GENERIC_ERROR, PASSWORD_HELP_TEXT } from "../../../utils/form-strings";
import { ROUTE_CHANGE_PASSWORD } from '../../../utils/routes';

export class PasswordForm extends Component {
    handleSubmit = async e =>{
        e.preventDefault();

        const passwordError = this.props.verifyPasswordBeforeSubmit();
        const currentPasswordError = this.props.checkIfCurrentPasswordIsEmpty();
        if (passwordError || currentPasswordError) {
            return;
        }

        this.props.setLoading(true);
        const response = await fetch(ROUTE_CHANGE_PASSWORD, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                password: this.props.passwordField,
                secondPassword: this.props.secondPasswordField,
                currentPassword: this.props.currentPassword
            })
        })
        this.props.setLoading(false);

        if (response.ok) {
            this.props.closeModal();
            this.props.showAlert("You have successfully changed your password.", "success");
        }
        else if (response.status === 401) {
            const body = await response.json();
            this.props.setCurrentPasswordForm({ error: body.error });
        }
        else {
            this.props.showAlert(GENERIC_ERROR, "danger");
            this.props.closeModal();
        }
    }

    render() {
        const {
            loading,
            currentPassword,
            currentPasswordError,
            passwordField,
            passwordFieldError,
            secondPasswordField,
            verificationError,
            handlePasswordChange,
            handleSecondPasswordChange,
            handleCurrentPasswordChange
        } = this.props;

        return (
            <>
                <ModalHeader closeButton>
                    Enter your new password
                </ModalHeader>
                <ModalBody>
                    <form className="mx-3">
                        <FormInput
                            type="password"
                            label="Current password"
                            value={currentPassword}
                            error={currentPasswordError}
                            onChange={handleCurrentPasswordChange}
                            loading={loading}
                        />
                        <FormInput
                            type="password"
                            label="New password"
                            value={passwordField}
                            error={passwordFieldError}
                            onChange={handlePasswordChange}
                            help={PASSWORD_HELP_TEXT}
                            loading={loading}
                        />
                        <FormInput
                            type="password"
                            label="Verify new password"
                            value={secondPasswordField}
                            error={verificationError}
                            onChange={handleSecondPasswordChange}
                            loading={loading}
                        />
                        <FormButton
                            title="Submit"
                            onSubmit={this.handleSubmit}
                            loading={loading}
                            centered
                        />
                    </form>
                </ModalBody>
            </>
        );
    }
}

export default withLoader(withCurrentPassword(withPasswordValidation(PasswordForm)));
