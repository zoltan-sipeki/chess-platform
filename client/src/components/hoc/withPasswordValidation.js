import React, { Component } from 'react';
import { validatePassword, verifyPassword } from '../../common/validators';

function withPasswordValidation(WrappedComponent) {
    return class WithPasswordValidation extends Component {
        constructor(props) {
            super(props);
        
            this.state = {
                password: "",
                error: null,
                secondPassword: "",
                verificationError: null
            };
        }

        handlePasswordChange = e => {
            const password = e.target.value;
            const error = validatePassword(password);
    
            const { secondPassword } = this.state;
            const verificationError = secondPassword ? verifyPassword(password, secondPassword) : null;
    
            this.setState(state => ({ password, error, verificationError: secondPassword ? verificationError: state.verificationError }));
        }

        handleSecondPasswordChange = e => {
            const secondPassword = e.target.value;
            const verificationError = verifyPassword(this.state.password, secondPassword);
            console.log(verificationError);
            this.setState({ secondPassword, verificationError });
        }

        setPasswordForm = obj => {
            this.setState(state => ({ ...state, ...obj }));
        }
        
        resetPasswordForm = () => {
            this.setState({ password: "", error: null, secondPassword: "", verificationError: null });
        }

        verifyPasswordBeforeSubmit = () => {
            const { password, secondPassword } = this.state;
            const error = validatePassword(this.state.password);
            const verificationError = verifyPassword(password, secondPassword);

            this.setState({ error, verificationError });

            if (error || verificationError) {
                return true;
            }

            return false;
        }
        
        render() {
            const { password, error, secondPassword, verificationError } = this.state;

            return (
                <WrappedComponent
                    {...this.props}
                    handlePasswordChange={this.handlePasswordChange}
                    handleSecondPasswordChange={this.handleSecondPasswordChange}
                    passwordField={password}
                    passwordFieldError={error}
                    secondPasswordField={secondPassword}
                    verificationError={verificationError}
                    setPasswordForm={this.setPasswordForm}
                    resetPasswordForm={this.resetPasswordForm}
                    verifyPasswordBeforeSubmit={this.verifyPasswordBeforeSubmit}
                />
            );
        }
    }
}

export default withPasswordValidation;