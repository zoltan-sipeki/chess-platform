import React, { Component } from "react";
import Timer from "../../Timer";
import Toast from "./Toast";

class FindingMatch extends Component {
    render() {
        const { show, close, type } = this.props;
        return (
            <Toast header={`${type} queue`} show={show} close={close}>
                <div className="d-flex align-items-center">
                    <div
                        className="spinner-border text-secondary me-2"
                        style={{ width: "1rem", height: "1rem" }}
                    ></div>
                    Finding match...
                </div>
                <Timer />
            </Toast>
        );
    }
}

export default FindingMatch;