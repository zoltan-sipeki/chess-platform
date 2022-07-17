import React, { Component } from 'react';
import { Link } from "react-router-dom";
import Bishop from "../../imgs/bishop.svg";
import King from "../../imgs/king.svg";
import Knight from "../../imgs/knight.svg";
import Pawn from "../../imgs/pawn.svg";
import Queen from "../../imgs/queen.svg";
import Rook from "../../imgs/rook.svg";
import { LINK_SIGN_IN, LINK_SIGN_UP } from '../../utils/routes';
import Navbar from '../Navbar';

class HomePage extends Component {
    render() {
        return (
            <>
                <Navbar to="/">
                    <div className="nav-item">
                        <small className="navbar-text">Already have an account?</small>
                        <Link to={LINK_SIGN_IN} className="btn btn-success mx-2 nav-item">Sign in</Link>
                    </div>
                </Navbar>
                <div className="container">
                    <div className="row mt-5"></div>
                    <div className="row mt-5">
                        <div className="col-lg pb-5 glide-in-from-left">
                            <h1 className="fw-bold">Play chess online for free!</h1>
                            <h2>What we offer:</h2>
                            <ul>
                                <li>Competitive / casual matchmaking</li>
                                <li>Leaderboard</li>
                                <li>Social features</li>
                                <li>And many more</li>
                            </ul>
                            <hr />
                            <p>Don't have an account?</p>
                            <Link to={LINK_SIGN_UP} className="btn btn-lg btn-primary">
                                Sign up
                            </Link>
                        </div>
                        <div className="col-lg position-relative glide-in-from-right">
                            <img className="fade-in-out bg-light position-absolute w-100 py-5" height="300" alt="" src={Bishop} />
                            <img className="fade-in-out bg-light position-absolute w-100 py-5" height="300" alt="" src={King} />
                            <img className="fade-in-out bg-light position-absolute w-100 py-5" height="300" alt="" src={Knight} />
                            <img className="fade-in-out bg-light position-absolute w-100 py-5" height="300" alt="" src={Pawn} />
                            <img className="fade-in-out bg-light position-absolute w-100 py-5" height="300" alt="" src={Queen} />
                            <img className="fade-in-out bg-light position-absolute w-100 py-5" height="300" alt="" src={Rook} />
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default HomePage;
