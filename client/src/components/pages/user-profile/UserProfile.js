import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import VPContainer from '../../VPContainer';
import ButtonGroup from './ButtonGroup';
import GeneralInformation from './GeneralInformation';
import Friends from './Friends';
import Matches from "./Matches";
import Avatar from '../../Avatar';
import * as SSE from "../../../common/message-types/sse-messages-types.mjs";
import Stats from './Stats';
import { ROUTE_USER_PROFILE } from '../../../utils/routes';

const FRIENDS_LIMIT = 7;
const GAMES_LIMIT = 10;

export class UserProfile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            profile: null
        }

        this.abort = new AbortController();
    }

    componentDidMount() {
        this.fetchProfile();
        if (this.props.eventSource !== null) {
            this.props.eventSource.addEventListener("message", this.handleEventSource);
        }

        document.addEventListener("profile_refresh", this.onProfileRefresh);
    }

    componentDidUpdate(prevProps) {
        if (this.props.match.params.id !== prevProps.match.params.id) {
            this.fetchProfile();
        }

        if (this.props.eventSource !== prevProps.eventSource && this.props.eventSource !== null) {
            this.props.eventSource.addEventListener("message", this.handleEventSource);
        }
    }

    componentWillUnmount() {
        this.abort.abort();
        if (this.props.eventSource !== null) {
            this.props.eventSource.removeEventListener("message", this.handleEventSource);
        }

        document.removeEventListener("profile_refresh", this.onProfileRefresh);
    }

    handleEventSource = e => {
        const event = JSON.parse(e.data);
        console.log(event);
        let friendId = "";
        switch (event.type) {
            case SSE.REMOVE_FRIEND:
                friendId = event.data.friendId;
                break;

            case SSE.FRIEND_REQUEST_ACCEPTED:
                friendId = event.data.friend.id;
                break;

            default:
                break;
        }

        this.refreshProfile(friendId);
    }

    refreshProfile(friendId) {
        if (friendId !== "" && this.props.match.params.id === friendId) {
            this.fetchProfile();
        }
    }

    onProfileRefresh = e => {
        this.refreshProfile(e.detail.friendId);
    }

    async fetchProfile() {
        const userID = this.props.match.params.id;

        try {
            const response = await fetch(ROUTE_USER_PROFILE(userID, FRIENDS_LIMIT, GAMES_LIMIT), {
                signal: this.abort.signal
            });

            if (response.ok) {
                const profile = await response.json();
                this.setState({ profile });
            }
        }
        catch (err) {
            if (err.name === "AbortError") {
                return;
            }
        }
    }

    render() {
        const { profile } = this.state;
        const { unfriend, inviteFriendToPlay } = this.props;

        if (profile === null) {
            return null;
        }

        const { visible, relation, user, general, stats, friends, matches } = profile;

        let body = null;
        if (visible) {
            body = (
                <>
                    <div className="d-xl-flex justify-content-evenly mb-3">
                        <GeneralInformation info={general} />
                        <Friends friends={friends} userId={user.id} />
                    </div>
                    <Stats stats={stats} />
                    <Matches matches={matches} userId={user.id} />
                </>
            );
        }
        else {
            body = (
                <div className="d-flex flex-column align-items-center justify-content-center mt-3">
                    <h4 className="mt-4 mb-3">This profile is private.</h4>
                </div>
            );
        }

        return (
            <VPContainer className="container mt-2">
                <h3 className="mb-4">
                    <i className="bi bi-file-person fs-2"></i> {user.name}<span className="text-muted">#{user.tag}</span>'s profile
                </h3>
                <div className="d-md-flex justify-content-evenly align-items-center mb-3">
                    <Avatar src={user.avatar} />
                    <ButtonGroup
                        relation={relation}
                        userId={user.id}
                        chatroomId={user.chatroomId}
                        unfriend={unfriend}
                        inviteFriendToPlay={inviteFriendToPlay}
                    />
                </div>
                {body}
            </VPContainer>
        );
    }
}

export default withRouter(UserProfile);
