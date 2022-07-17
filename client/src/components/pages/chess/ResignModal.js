import React, { Component } from 'react'
import Modal from "../../modal/Modal";
import ModalHeader from "../../modal/ModalHeader";
import ModalBody from "../../modal/ModalBody";
import ModalFooter from "../../modal/ModalFooter";

class ResignModal extends Component {
    render() {
        const { resign, hide, onClose, show } = this.props;
        return (
            <Modal show={show} onClose={onClose}>
                <ModalHeader closeButton>
                    Warning
                </ModalHeader>
                <ModalBody>
                    Are you sure you want to resign?
                </ModalBody>
                <ModalFooter>
                    <button onClick={resign} className="btn btn-danger">Resign</button>
                    <button onClick={hide} className="btn btn-secondary">Close</button>
                </ModalFooter>
            </Modal>
        )
    }
}

export default ResignModal;
