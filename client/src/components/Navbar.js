import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Brand from "../imgs/brand-yellow.svg"

class Navbar extends Component {
    render() {
        const { children, to } = this.props;

        return (
            <nav className="navbar navbar-expand navbar-dark bg-dark">
                <div className="container-fluid">
                    <Link to={to} className="navbar-brand">
                        <img className="align-top mx-2" height="30" width="30" src={Brand} alt="Logo" />
                        Chess
                    </Link>
                    {children}
                </div>
            </nav>
        );
    }
}

export default Navbar;
