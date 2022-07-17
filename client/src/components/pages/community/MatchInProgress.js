import React, { Component } from 'react';
import { LINK_MATCH } from "../../../utils/routes";
import Toast from "./Toast";

class MatchInProgress extends Component {
    onClick = e => {
        window.open(LINK_MATCH(this.props.matchId));
    }

    render() {
        const { matchId } = this.props;
        return (
            <Toast header="Match in progress" show={matchId !== null}>
                <>
                    Click the button to resume playing:
                    <button className="btn btn-sm btn-primary" onClick={this.onClick}>
                        Open
                    </button>
                </>
            </Toast>
        );
    }
}

export default MatchInProgress;