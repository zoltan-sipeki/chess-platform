import React, { Component } from 'react';

export class ModalBody extends Component {
    render() {
        const { children } = this.props;

        return (
            <div className="modal-body">
                { children }
            </div>
        );
    }
}

export default ModalBody;
