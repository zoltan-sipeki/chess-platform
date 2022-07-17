import React, { Component } from 'react';
import Modal from '../../modal/Modal';
import InviteModalContent from './InviteModalContent';
import QueueModalContent from './QueueModalContent';
import FindingMatch from './FindingMatch';
import * as MSG from "../../../common/message-types/chess-message-types.mjs";
import MatchInProgress from './MatchInProgress';
import { LINK_MATCH } from '../../../utils/routes';
import { OPPONENT, SELF } from "./prematch-states";

class GameManager extends Component {
    constructor(props) {
        super(props);
        
        this.defaultState =  {
            state: 0,
            matchType: "",
            opponent: {
                player: null,
                state: 0
            },
            inviter: null,
            invitee: null
        };

        this.state = {
            ...this.defaultState
        };

        this.closeTimeout = -1;
        this.gameId = -1;
    }

    componentDidMount() {
        if (this.props.chessSocket !== null) {
            this.props.chessSocket.port.addEventListener("message", this.handleGameSocket);
        }
    }

    componentWillUnmount() {
        if (this.props.chessSocket !== null) {
            this.props.chessSocket.port.removeEventListener("message", this.handleGameSocket);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.gameSocket !== this.props.chessSocket && this.props.chessSocket !== null) {
            this.props.chessSocket.port.addEventListener("message", this.handleGameSocket);
        }

        if (prevState.opponent.state !== this.state.opponent.state) {
            if (this.state.opponent.state !== OPPONENT.READY) {
                this.closeModal();
            }
        }

        if (prevProps.gameModalShown !== this.props.gameModalShown && !this.props.gameModalShown) {
            setTimeout(() => this.resetState(), 300);
        }
    }

    closeModal() {
        this.closeTimeout = setTimeout(() => this.props.closeGameModal(), 2000);
    }

    handleGameSocket = e => {
        const msg = e.data;

        switch (msg.type) {
            case MSG.S_QUEUE:
                this.handleQueue(msg);
                break;

            case MSG.S_GAME_READY:
                this.handleGameReady(msg);
                break;

            case MSG.S_READY:
                this.handleReady(msg);
                break;

            case MSG.S_READY_ERROR:
                this.handleReadyError(msg);
                break;

            case MSG.S_DECLINE:
                this.handleDecline(msg);
                break;

            case MSG.S_INVITE:
                this.handleInvite(msg);
                break;
                
            case MSG.S_INVITE_SUCCESS:
                this.handleInviteSuccess(msg);
                break;

            case MSG.S_DISCONNECT:
                this.handleDisconnect(msg);
                break;

            case MSG.S_GAME_STARTED:
                this.handleGameStarted(msg);
                break;

            case MSG.S_GAME_ENDED:
                this.handleGameEnded(msg);
                break;

            default:
                break;
        }
    }

    handleQueue(msg) {
        this.setState({ state: SELF.FINDING_MATCH, matchType: msg.data.type });
    }

    handleGameReady(msg) {
        this.gameId = msg.data.roomId;
        clearTimeout(this.closeTimeout);
        this.setState({ state: SELF.FINDING_MATCH });
        this.props.setGameModal();
    }

    handleReady(msg) {
        if (this.state.state & SELF.GAME_ACCEPTED) {
            this.startGame();
        }
        else {
            this.setState({ opponent: { ...this.state.opponent, state: OPPONENT.READY } });
        }
    }

    handleReadyError(msg) {
        if (!msg.data.players.find(id => id === this.props.userId)) {
            this.setState({ opponent: { ...this.state.opponent, state: OPPONENT.TIMED_OUT } });
        }
        else {
            this.setState({ state: SELF.TIMED_OUT });
        }
    }

    handleDecline(msg) {
        this.setState({ opponent: { ...this.state.opponent, state: OPPONENT.DECLINED } });
    }

    handleInvite(msg) {
        clearTimeout(this.closeTimeout);
        this.gameId = msg.data.roomId;
        this.props.setGameModal();
        this.setState({ state: SELF.INVITE | SELF.GAME_ACCEPTED, opponent: { ...this.state.opponent, state: OPPONENT.READY }, inviter: msg.data.inviter });
    }

    handleInviteSuccess(msg) {
        clearTimeout(this.closeTimeout);
        this.gameId = msg.data.roomId;
        this.props.setGameModal();
        this.setState({ state: SELF.INVITE | SELF.GAME_ACCEPTED, opponent: { player: null, state: 0 }, invitee: msg.data.invitee });
    }
    
    handleGameStarted(msg) {
        this.props.setUser({ matchIdInProgress: msg.data.matchId });
    }
    
    handleDisconnect(msg) {
        this.setState({ opponent: { player: msg.data.player, state: OPPONENT.DISCONNECTED } });
    }

    handleGameEnded(msg) {
        if (this.props.matchIdInProgress === msg.data.matchId) {
            this.props.setUser({ matchIdInProgress: null });
        }
    }

    startGame() {
        this.props.closeGameModal();
        window.open(LINK_MATCH(this.gameId));
        this.gameId = -1;
    }

    acceptGame = () => {
        this.props.chessSocket.port.postMessage({ type: MSG.C_READY, data: null });
        if (this.state.opponent.state === OPPONENT.READY) {
            this.startGame();
        }
        else {
            this.setState({ state: SELF.GAME_ACCEPTED });
        }
    }

    declineGame = () => {
        this.props.chessSocket.port.postMessage({ type: MSG.C_DECLINE, data: null });
        this.props.closeGameModal();
        this.gameId = -1;
    }

    stopFindingMatch = () => {
        this.props.chessSocket.port.postMessage({ type: MSG.C_EXIT_QUEUE, data: null });
        this.setState({ state: this.state & ~SELF.FINDING_MATCH });
    }

    resetState() {
        this.setState({ ...this.defaultState });
    }

    render() {
        const { matchType, state } = this.state;
        const { matchIdInProgress, gameModalShown } = this.props;

        let modalContent = null;
        if (state & SELF.INVITE) {
            modalContent = (
                <InviteModalContent
                    queueState={this.state}
                    acceptGame={this.acceptGame}
                    declineGame={this.declineGame}
                />
            );
        }
        else {
            modalContent = (
                <QueueModalContent
                    queueState={this.state}
                    acceptGame={this.acceptGame}
                    declineGame={this.declineGame}
                />
            );
        }

        return (
            <>
                <Modal show={gameModalShown} static>
                    {modalContent}
                </Modal>
                <FindingMatch
                    show={Boolean(state & SELF.FINDING_MATCH)}
                    type={matchType}
                    close={this.stopFindingMatch}
                />
                <MatchInProgress matchId={matchIdInProgress} />
            </>
        );
    }
}

export default GameManager;
