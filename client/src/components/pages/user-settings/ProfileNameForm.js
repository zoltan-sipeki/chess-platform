import React, { Component } from 'react';
import FormInput from '../../form/FormInput';
import FormButton from '../../form/FormButton';
import { PROFILE_NAME_INPUT_HELP_TEXT, GENERIC_ERROR } from "../../../utils/form-strings";
import withLoader from '../../hoc/withLoader';
import ModalHeader from '../../modal/ModalHeader';
import ModalBody from '../../modal/ModalBody';
import withNameValidation from '../../hoc/withNameValidation';
import { ROUTE_CHANGE_PROFILE_NAME } from '../../../utils/routes';

export class NameForm extends Component {
    handleSubmit = async e => {
        e.preventDefault();

        const error = this.props.verifyNameBeforeSubmit();
        if (error) {
            return;
        }

        if (this.props.nameField === this.props.name) {
            this.props.setNameForm({ error: "Your profile name is the same." });
            return;
        }

        this.props.setLoading(true);
        const response = await fetch(ROUTE_CHANGE_PROFILE_NAME, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: this.props.nameField })
        });

        if (response.ok) {
            const body = await response.json();
            this.props.setUser({ name: body.name, tag: body.tag });
            this.props.showAlert(
                <>You have successfully changed your profile name to <strong>{body.name}#{body.tag}</strong>.</>,
                "success"
            );
        }
        else {
            this.props.showAlert(GENERIC_ERROR, "danger");
        }

        this.props.setLoading(false);

        this.props.closeModal();
    }

    render() {
        const { loading, nameField, nameFieldError, handleNameChange } = this.props;

        return (
            <>
                <ModalHeader closeButton>
                    Enter your new profile name
                </ModalHeader>
                <ModalBody>
                    <form className="mx-4" onSubmit={this.handleSubmit}>
                        <FormInput
                            label="New profile name"
                            help={PROFILE_NAME_INPUT_HELP_TEXT}
                            value={nameField}
                            error={nameFieldError}
                            onChange={handleNameChange}
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

export default withNameValidation(withLoader(NameForm));
