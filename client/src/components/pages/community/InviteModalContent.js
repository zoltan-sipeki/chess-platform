import React, { Component } from 'react';
import ModalBody from '../../modal/ModalBody';
import ModalHeader from '../../modal/ModalHeader';
import Spinner from '../../Spinner';
import User from '../../user/User';
import { OPPONENT, SELF } from "./prematch-states";

class InviteModalContent extends Component {
    render() {
        const { acceptGame, declineGame, queueState } = this.props;
        const { state, opponent, inviter, invitee } = queueState;

        let content = null;
        if (state & SELF.TIMED_OUT) {
            content = (
                <div className="text-center mb-3">
                    You have failed to respond in the specified time frame.
                </div>
            );
        }
        else if (opponent.state === OPPONENT.DECLINED) {
            content = (
                <div className="mb-3 d-flex justify-content-center align-items-center">
                    <User name={invitee.name} tag={invitee.tag} avatar={invitee.avatar} />
                    <div className="ms-1">has declined to play the game.</div>
                </div>
            );
        }
        else if (opponent.state === OPPONENT.DISCONNECTED) {
            const { player } = opponent;
            content = (
                <div className="mb-3 d-flex justify-content-center align-items-center">
                    <User name={player.name} tag={player.tag} avatar={player.avatar} />
                    <div className="ms-1">has disconnected.</div>
                </div>
            );
        }
        else if (opponent.state === OPPONENT.TIMED_OUT) {
            content = (
                <div className="mb-3 d-flex justify-content-center align-items-center">
                    <User name={invitee.name} tag={invitee.tag} avatar={invitee.avatar} />
                    <div className="ms-1">has taken too long to respond.</div>
                </div>
            );
        }
        else if (inviter != null) {
            content = (
                <div>
                    <div className="mb-3 d-flex justify-content-center align-items-center">
                        <User name={inviter.name} tag={inviter.tag} avatar={inviter.avatar} />
                        <div className="ms-1">has invited you to play a game.</div>
                    </div>
                    <div className="d-flex justify-content-center">
                        <button className="btn btn-primary me-5" onClick={acceptGame}>Accept</button>
                        <button className="btn btn-secondary" onClick={declineGame}>Decline</button>
                    </div>
                </div>
            );
        }
        else {
            content = (
                <div>
                    <div className="mb-3 d-flex justify-content-center align-items-center">
                        <div className="me-3">Waiting for</div>
                        <User name={invitee.name} tag={invitee.tag} avatar={invitee.avatar} />
                        <div className="ms-3">to get ready...</div>
                    </div>
                    <Spinner className="text-secondary" />
                </div>
            );
        }

        return (
            <>
                <ModalHeader>Invitation</ModalHeader>
                <ModalBody>
                    {content}
                </ModalBody>
            </>
        );
    }
}

export default InviteModalContent;
