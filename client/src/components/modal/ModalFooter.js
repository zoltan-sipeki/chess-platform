import React, { Component } from 'react';

export class ModalFooter extends Component {
    render() {
        const { children } = this.props;
        
        return (
            <div className="modal-footer">
                { children }
            </div> 
        );
    }
}

export default ModalFooter;
