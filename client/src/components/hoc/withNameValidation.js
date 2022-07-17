import React, { Component } from 'react';
import { validateProfileName } from '../../common/validators';

function withNameValidation(WrappedComponent) {
    return class WithNameValidation extends Component {
        constructor(props) {
            super(props);
        
            this.state = {
                 name: "",
                 error: null
            };
        }

        handleNameChange = e => {
            const name = e.target.value;
            const error = validateProfileName(name);
            this.setState({ name, error });
        }

        setNameForm = obj => {
            this.setState(state => ({ ...state, ...obj }));
        }

        resetNameForm = obj => {
            this.setState({ name: "", error: null });
        }

        verifyNameBeforeSubmit = () => {
            const error = validateProfileName(this.state.name);
            
            this.setState({ error });
            
            if (error) {
                return true;
            }

            return false;
        }
        
        render() {
            const { name, error } = this.state;

            return (
                <WrappedComponent
                    {...this.props}
                    handleNameChange={this.handleNameChange}
                    nameField={name}
                    nameFieldError={error}
                    setNameForm={this.setNameForm}
                    resetNameForm={this.resetNameForm}
                    verifyNameBeforeSubmit={this.verifyNameBeforeSubmit}
                />
            );
        }
    }
}

export default withNameValidation;