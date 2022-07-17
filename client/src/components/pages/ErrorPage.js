import React, { Component } from 'react';
import ErrorImage from "../../imgs/error.svg";

class ErrorPage extends Component {
    render() {
        const { code, message } = this.props;

        return (
            <div className="container">
                <div className="row mt-5">
                    <div className="col-lg">
                        <div className="mx-auto mb-5" style={style}>
                            <h1 className="fw-bold">ERROR {code}:</h1>
                            <hr />
                            <h3 className="mb-5">{message}</h3>
                            <img className="mx-auto d-block" height="200" width="200" src={ErrorImage} alt="" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const style = {
    width: "700px" 
};

export default ErrorPage;
