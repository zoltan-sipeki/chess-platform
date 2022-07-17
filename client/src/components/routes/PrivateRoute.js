import React, { Component } from 'react'
import { Redirect } from 'react-router-dom';

class PrivateRoute extends Component {
    render() {
        const { loggedIn, children } = this.props;

        if (loggedIn) {
            return children;
        }

        return <Redirect to="/auth/sign-in" />;
    }
}

export default PrivateRoute