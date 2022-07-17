import React, { Component } from 'react';

export class ModalHeader extends Component {
    closeModal = () => {
        document.dispatchEvent(new CustomEvent("modal.closebutton"));
    }

    render() {
        const { className, children, closeButton } = this.props;

        return (
            <div className={`modal-header ${className ?? ""}`}>
                <h5 className="modal-title">{ children }</h5>
                { closeButton && <button className="btn btn-close" onClick={this.closeModal}></button> }
            </div>
        );
    }
}

export default ModalHeader;
