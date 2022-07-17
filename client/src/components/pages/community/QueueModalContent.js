import React, { Component } from 'react';
import ModalBody from '../../modal/ModalBody';
import ModalHeader from '../../modal/ModalHeader';
import Spinner from '../../Spinner';
import { OPPONENT, SELF } from "./prematch-states";

class QueueModalContent extends Component {
    render() {
        const { acceptGame, declineGame, queueState } = this.props;
        const { state, opponent } = queueState;

        let content = null;
        if (state & SELF.TIMED_OUT) {
            content = (
                <div className="text-center mb-3">
                    You have taken too long to respond. Leaving queue...
                </div>
            );
        }
        else if (opponent.state === OPPONENT.DECLINED || opponent.state === OPPONENT.DISCONNECTED) {
            content = (
                <div className="text-center mb-3">
                    Your opponent has declined to play the game. Leaving queue...
                </div>
            );
        }
        else if (opponent.state === OPPONENT.TIMED_OUT) {
            content = (
                <div className="text-center mb-3">
                    Your opponent has taken too long to respond. Leaving queue...
                </div>
            );
        }
        else if (!(state & SELF.GAME_ACCEPTED)) {
            content = (
                <div>
                    <div className="text-center mb-3">A ranked game is ready for you to join.</div>
                    <div className="d-flex justify-content-center">
                        <button className="btn btn-primary me-5" onClick={acceptGame}>Accept</button>
                        <button className="btn btn-secondary" onClick={declineGame}>Decline</button>
                    </div>
                </div>
            );
        }
        else if (opponent.state !== OPPONENT.READY) {
            content = (
                <div>
                    <div className="text-center mb-3">Waiting for your opponent to get ready...</div>
                    <Spinner className="text-secondary" />
                </div>
            );
        }

        return (
            <>
                <ModalHeader>Game ready</ModalHeader>
                <ModalBody>
                    {content}
                </ModalBody>
            </>
        );
    }
}

export default QueueModalContent;
