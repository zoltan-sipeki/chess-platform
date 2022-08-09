import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import ForgotPasswordPage from './components/pages/auth/ForgotPasswordPage';
import SignUpPage from './components/pages/auth/SignUpPage';
import SignInPage from './components/pages/auth/SignInPage';
import PasswordPage from './components/pages/auth/PasswordPage';
import HomePage from './components/pages/HomePage';
import CommunityPage from './components/pages/community/CommunityPage';
import ErrorPage from "./components/pages/ErrorPage";
import { getCookie } from './utils/misc';
import ChessPage from "./components/pages/chess/ChessPage";
import ChessReplay from './components/pages/chess/ChessReplay';
import PublicRoute from './components/routes/PublicRoute';
import PrivateRoute from './components/routes/PrivateRoute';

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loggedIn: this.isLoggedIn()
        };

        this.timerID = -1;
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    componentDidMount() {
        this.timerID = setInterval(this.checkLoggedIn, 5000);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.loggedIn !== this.state.loggedIn) {
            if (this.state.loggedIn) {
                this.timerID = setInterval(this.checkLoggedIn, 5000);
            }
            else {
                clearInterval(this.timerID);
            }
        }
    }

    checkLoggedIn = () => {
        console.log("checking login");
        if (!this.state.loggedIn) {
            clearInterval(this.timerID);
            return;
        }

        if (!this.isLoggedIn()) {
            this.logout();
        }
    }

    isLoggedIn = () => {
        const loggedIn = getCookie("loggedIn");
        return loggedIn === "true";
    }

    login = () => {
        this.setState({
            loggedIn: true
        });
    }

    logout = () => {
        this.setState({
            loggedIn: false
        });
    }

    render() {
        const { loggedIn } = this.state;
        return (
            <BrowserRouter>
                <Switch>
                    <Route path="/" exact>
                        <PublicRoute loggedIn={loggedIn}>
                            <HomePage />
                        </PublicRoute>
                    </Route>
                    <Route path="/auth/sign-in" exact>
                        <PublicRoute loggedIn={loggedIn}>
                            <SignInPage login={this.login} />
                        </PublicRoute>
                    </Route>
                    <Route path="/auth/sign-up" exact>
                        <PublicRoute loggedIn={loggedIn}>
                            <SignUpPage />
                        </PublicRoute>
                    </Route>
                    <Route path="/auth/sign-up/complete" exact>
                        <PublicRoute loggedIn={loggedIn}>
                            <PasswordPage modalMessage={finishSignUpModalMessage} buttonText="Sign up" />
                        </PublicRoute>
                    </Route>
                    <Route path="/auth/forgot-password" exact>
                        <PublicRoute loggedIn={loggedIn}>
                            <ForgotPasswordPage />
                        </PublicRoute>
                    </Route>
                    <Route path="/auth/reset-password" exact>
                        <PublicRoute loggedIn={loggedIn}>
                            <PasswordPage modalMessage={resetPasswordModalMessage} buttonText="Reset password" />
                        </PublicRoute>
                    </Route>
                    <Route path="/community/matches/:id/replay">
                        <PrivateRoute loggedIn={loggedIn}>
                            <ChessReplay />
                        </PrivateRoute>
                    </Route>
                    <Route path="/community/matches/:id">
                        <PrivateRoute loggedIn={loggedIn}>
                            <ChessPage />
                        </PrivateRoute>
                    </Route>
                    <Route path="/community">
                        <PrivateRoute loggedIn={loggedIn}>
                            <CommunityPage logout={this.logout} />
                        </PrivateRoute>
                    </Route>
                    <Route>
                        <ErrorPage code={404} message="Not found" />
                    </Route>
                </Switch>
            </BrowserRouter>
        );
    }
}

const resetPasswordModalMessage = (
    <>
        <p>You have successfully reset your password.</p>
        <p>Click on the button below to be logged back in to the site.</p>
    </>
);

const finishSignUpModalMessage = (
    <>
        <p>You have successfully completed your registration.</p>
        <p>Click on the button below to log in to the site.</p>
    </>
);

export default App;
