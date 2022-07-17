import React, { Component } from 'react';
import Alert from "../../Alert";
import Navbar from '../../Navbar';
import ErrorPage from "../ErrorPage";
import { Redirect } from 'react-router';
import Modal from '../../modal/Modal';
import withLoader from "../../hoc/withLoader";
import ModalHeader from '../../modal/ModalHeader';
import ModalBody from "../../modal/ModalBody";
import ModalFooter from "../../modal/ModalFooter";
import withAlert from '../../hoc/withAlert';

function AuthPage(WrappedComponent) {
    class WithAuthPage extends Component {
        constructor(props) {
            super(props);

            this.state = {
                error: new ErrorState(),
                redirect: false,
                redirectPath: "",
                modalShown: false,
                modalContent: null
            };
        }

        showModal = (content, redirectPath) => {
            this.setState({
                redirectPath: redirectPath,
                modalContent: content,
                modalShown: true
            });
        }

        closeModal = e => {
            this.setState({
                modalShown: false,
                redirect: true
            });
        }

        handleAlertClose = e => {
            this.setState({
                alert: new AlertState(true)
            });
        }

        alert = (message, error) => {
            this.setState({
                alert: new AlertState(false, error, message)
            });
        }

        error = (code, message) => {
            this.setState({
                error: new ErrorState(code, message)
            });
        }

        render() {
            const { loading, setLoading, alertType, alertVisible, alertContent, closeAlert, showAlert } = this.props;
            const { error, redirect, redirectPath, modalShown, modalContent } = this.state;

            if (error.code > 0) {
                return <ErrorPage code={error.code} message={error.message} />;
            }

            if (redirect) {
                return <Redirect to={redirectPath} />;
            }

            return (
                <>
                    <Navbar to="/" />
                    <div className="container">
                        <div className="row mt-3">
                            <div className="col-lg-2"></div>
                            <div className="col-lg-8">
                                <Alert type={alertType} show={alertVisible} onClose={closeAlert}>
                                    {alertContent}
                                </Alert> 
                            </div>
                            <div className="col-lg-2"></div>
                        </div>
                        <div className="row mt-4">
                            <div className="col-lg-2"></div>
                            <div className="col-lg-8">
                                <WrappedComponent {...this.props}
                                    alert={showAlert}
                                    error={this.error}
                                    showModal={this.showModal}
                                    loading={loading}
                                    setLoading={setLoading} />
                            </div>
                            <div className="col-lg-2"></div>
                        </div>
                    </div>
                    <Modal show={modalShown} onClose={this.closeModal}>
                        <ModalHeader className="bg-success text-white">
                            Success
                        </ModalHeader>
                        <ModalBody>
                            {modalContent}
                        </ModalBody>
                        <ModalFooter>
                            <button className="btn btn-primary" onClick={this.closeModal}>OK</button>
                        </ModalFooter>
                    </Modal>
                </>
            );
        }
    }

    return withAlert(withLoader(WithAuthPage));
}

class AlertState {
    constructor(hidden = true, error = false, message = null) {
        this.hidden = hidden;
        this.error = error;
        this.message = message;
    }
}

class ErrorState {
    constructor(code = 0, message = "") {
        this.code = code;
        this.message = message;
    }
}

export default AuthPage;
