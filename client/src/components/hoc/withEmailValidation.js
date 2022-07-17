import React, { Component } from 'react';
import { validateEmail } from '../../common/validators';

function withEmailValidation(WrappedComponent) {
    return class WithEmailValidation extends Component {
        constructor(props) {
            super(props);
        
            this.state = {
                 email: "",
                 error: null
            };
        }

        handleEmailChange = e => {
            const email = e.target.value;
            const error = validateEmail(email);
            this.setState({ email, error });
        }
        
        setEmailForm = obj => {
            this.setState(state => ({...state, ...obj }));
        }

        resetEmailForm = () => {
            this.setState({ email: "", error: null });
        }

        verifyEmailBeforeSubmit = () => {
            const error = validateEmail(this.state.email);
            this.setState({ error });

            if (error) {
                return true;
            }

            return false;
        }   

        render() {
            const { email, error } = this.state;

            return (
                <WrappedComponent
                    {...this.props}
                    handleEmailChange={this.handleEmailChange}
                    emailField={email}
                    emailFieldError={error}
                    setEmailForm={this.setEmailForm}
                    resetEmailForm={this.resetEmailForm}
                    verifyEmailBeforeSubmit={this.verifyEmailBeforeSubmit}
                />
            );
        }
    }
}

export default withEmailValidation;
