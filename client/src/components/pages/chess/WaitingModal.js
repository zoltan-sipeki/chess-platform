import React, { Component } from 'react';
import Modal from "../../modal/Modal";
import ModalHeader from "../../modal/ModalHeader";
import ModalBody from "../../modal/ModalBody";
import Spinner from "../../Spinner";

class WaitingModal extends Component {
    closeWindow = e => {
        window.close();
    }

    render() {
        const { show, failedToLoad } = this.props;

        let body = null;
        if (failedToLoad) {
            body = (
                <>
                    <ModalBody>
                        <div className="text-center">
                            Your opponent has failed to load.
                        </div>
                    </ModalBody>
                    <div className="d-flex justify-content-center my-3">
                        <button onClick={this.closeWindow} className="btn btn-primary">Exit game</button>
                    </div>
                </>
            );
        }
        else {
            body = (
                <ModalBody>
                    <div className="text-center">
                        Waiting for your opponent to load...
                    </div>
                    <Spinner className="text-secondary mt-3" />
                </ModalBody>
            );
        }

        return (
            <Modal static show={show}>
                <ModalHeader>
                    Waiting
                </ModalHeader>
                {body}
            </Modal>
        );
    }
}

export default WaitingModal;
