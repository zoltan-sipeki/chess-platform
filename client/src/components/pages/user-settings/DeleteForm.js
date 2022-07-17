import React, { Component } from 'react';
import ModalHeader from "../../modal/ModalHeader";
import ModalBody from "../../modal/ModalBody";
import FormInput from '../../form/FormInput';
import FormButton from '../../form/FormButton';
import withLoader from '../../hoc/withLoader';
import withCurrentPassword from '../../hoc/withCurrentPassword';
import { ROUTE_DELETE_ACCOUNT } from '../../../utils/routes';

class DeleteForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            password: "",
            error: null,
            logout: false
        };
    }

    handlePasswordChange = e => {
        this.setState({ password: e.target.value });
    }

    handleSubmit = async e => {
        e.preventDefault();

        this.props.setLoading(true);

        let response = await fetch(ROUTE_DELETE_ACCOUNT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ currentPassword: this.state.password })
        });
        
        this.props.setLoading(false);
        
        if (response.ok) {
            console.log("success");
            this.props.logout();
        }
        else if (response.status === 401 || response.status === 409) {
            response  = await response.json();
            this.setState({ error: response.error });
        }
    }

    render() {
        const { password, error } = this.state;
        const { loading } = this.props;

        return (
            <>
                <ModalHeader closeButton>
                    Delete account
                </ModalHeader>
                <ModalBody>
                    <p className="text-center fs-4">None of your data will be recoverable once your account has been deleted.</p>
                    <p className="text-center">Please enter your password to delete your account.</p>
                    <form className="mx-4" onSubmit={this.handleSubmit}>
                        <FormInput
                            label="Current password"
                            type="password"
                            value={password}
                            error={error}
                            onChange={this.handlePasswordChange}
                            loading={loading}
                        />
                        <FormButton
                            title="Delete account"
                            loading={loading}
                            centered
                            onSubmit={this.handleSubmit}
                            color="danger"
                        />
                    </form>
                </ModalBody>
            </>
        );
    }
}

export default withLoader(withCurrentPassword(DeleteForm));