import React, { Component } from 'react';

class Spinner extends Component {
    render() {
        const { className } = this.props;
        return (
            <div className={`d-flex justify-content-center align-items-center ${className}`}>
                <div className="spinner-border me-2"></div>
            </div>
        );
    }
}

export default Spinner;
