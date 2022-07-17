import React, { Component } from 'react';

class FormHeader extends Component {
    render() {
        const { text } = this.props;

        return (
            <div className="mb-3">
                <h2 className="fw-bold">{text}</h2>
            </div>
        );
    }
}

export default FormHeader;
