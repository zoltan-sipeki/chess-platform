import React, { Component } from 'react'

export default function withCurrentPassword(WrappedComponent) {
    return class WithCurrentPassword extends Component {
        constructor(props) {
            super(props);
        
            this.state = {
                 password: "",
                 error: null
            };
        }

        handleCurrentPasswordChange = e => {
            this.setState({ password: e.target.value, error: null });
        }

        checkIfCurrentPasswordIsEmpty = () => {
            if (this.state.password.length === 0) {
                this.setState({ error: "Current password cannot be empty." });
                return true;
            }

            return false;
        }

        setCurrentPasswordForm = obj => {
            this.setState(state =>({ ...state, ...obj }));
        }

        render() {
            const { password, error } = this.state;

            return (
                <WrappedComponent
                    {...this.props}
                    currentPassword={password}
                    currentPasswordError={error}
                    handleCurrentPasswordChange={this.handleCurrentPasswordChange}
                    checkIfCurrentPasswordIsEmpty={this.checkIfCurrentPasswordIsEmpty}
                    setCurrentPasswordForm={this.setCurrentPasswordForm}
                />
            );
        }
    }
}
