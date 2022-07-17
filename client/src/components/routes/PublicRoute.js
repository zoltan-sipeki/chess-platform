import React, { Component } from 'react'
import { Redirect } from "react-router-dom";

class PublicRoute extends Component {
    render() {
        const { loggedIn, children } = this.props;

        if (loggedIn) {
            return <Redirect to="/community" />;
        }

        return children;
        
    }
}

export default PublicRoute;