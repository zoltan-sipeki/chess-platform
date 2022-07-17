import React, { Component } from 'react';

class Form extends Component {
    render() {
        const { onSubmit, children } = this.props;

        return (
            <form className="fade-in bg-light px-5 py-5 bg-white shadow rounded-3" onSubmit={onSubmit}>
                {children}
            </form>
        );
    }
}

export default Form;
