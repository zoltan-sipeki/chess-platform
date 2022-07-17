/* eslint-disable default-case */
import React, { Component } from 'react';
import { Switch, Route, withRouter, Link } from "react-router-dom";
import Navbar from '../../Navbar';
import NavSearchBar from './NavSearchBar';
import PlayMenu from '../../menu/PlayMenu';
import UserMenu from '../../menu/UserMenu';
import SocialBar from './SocialBar';
import MessageBar from './MessageBar';
import LeaderboardPage from '../LeaderboardPage';
import SearchPage from '../SearchPage';
import UserSettingsPage from '../user-settings/UserSettingsPage';
import UserProfile from '../user-profile/UserProfile';
import UserMatches from '../user-profile/UserMatches';
import UserFriends from '../user-profile/UserFriends';
import ChatWindow from '../chat-window/ChatWindow';
import Notifications from "../../notifications/Notifications";
import * as CHAT_MSG from "../../../common/message-types/chat-message-types.mjs";
import * as CHESS_MSG from "../../../common/message-types/chess-message-types.mjs";
import * as SSE from "../../../common/message-types/sse-messages-types.mjs";
import * as STATUS from "../../../common/user-statuses.mjs";
import MessageTab from './MessageTab';
import FriendList from './FriendList';
import PendingList from './PendingList';
import GameManager from './GameManager';
import { createChessSocketWorker, createChatSocketWorker } from '../../../utils/misc';
import { LINK_LEADERBOARD, ROUTE_EVENTS, ROUTE_CHAT_PARTNER, ROUTE_MY_ACCOUNT, ROUTE_UNFRIEND } from '../../../utils/routes';

const AWAY_DELAY = 5 * 60 * 1000;

class CommunityPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: {},
            notifications: [],
            friendRequests: [],
            friends: [],
            messageTabs: [],
            chatSocket: null,
            chessSocket: null,
            eventSource: null,
            formModalShown: false,
            gameModalShown: false
        };

        this.afkTimer = -1;
    }

    componentDidMount() {
        this.fetchUserData();
    }

    componentWillUnmount() {
        clearTimeout(this.afkTiner);
        document.removeEventListener("keydown", this.setUserOnlineWhenIdle);
        document.removeEventListener("click", this.setUserOnlineWhenIdle);
        if (this.state.chatSocket != null) {
            this.state.chatSocket.port.postMessage("close");
            this.state.chatSocket.port.close();
        }
        if (this.state.chessSocket != null) {
            this.state.chessSocket.port.postMessage("close");
            this.state.chessSocket.port.close();
        }
        if (this.state.eventSource != null) {
            this.state.eventSource.close();
        }
    }

    async fetchUserData() {
        let response = await fetch(ROUTE_MY_ACCOUNT);

        if (response.ok) {
            response = await response.json();

            let messageTabIds = JSON.parse(localStorage.getItem(`messageTabs:${response.user.id}`)) ?? [];
            messageTabIds = messageTabIds.filter(tabId => !response.messageTabs.find(tab => tab.chatroomId === tabId));

            let partners = messageTabIds.map(async tabId => {
                const tabResponse = await fetch(ROUTE_CHAT_PARTNER(tabId));
                if (tabResponse.ok) {
                    return await tabResponse.json();
                }
                return null;
            });

            partners = await Promise.all(partners);

            const messageTabs = [...response.messageTabs];
            for (let i = 0; i < partners.length; ++i) {
                if (partners[i] !== null) {
                    messageTabs.push({
                        chatroomId: messageTabIds[i],
                        partner: partners[i],
                        unread: 0
                    });
                }
            }

            this.setState({
                user: response.user,
                notifications: response.notifications,
                friendRequests: response.friendRequests,
                friends: response.friends,
                messageTabs,
                chatSocket: this.createChatSocket(),
                chessSocket: this.createChessSocket(),
                eventSource: this.createEventSource()
            });

            if (response.user.status === STATUS.US_ONLINE) {
                this.afkTimer = setTimeout(this.setUserAway, AWAY_DELAY);
                document.addEventListener("keydown", this.setUserOnlineWhenIdle);
                document.addEventListener("click", this.setUserOnlineWhenIdle);
            }
        }

    }

    setUser = newUser => {
        this.setState({ user: { ...this.state.user, ...newUser } });
    }

    setUserOnlineWhenIdle = () => {
        const { user } = this.state;
        if (user.status !== STATUS.US_ONLINE) {
            this.setState({
                user: { ...user, status: STATUS.US_ONLINE }
            });
            this.sendStatus({ status: STATUS.US_ONLINE });
        }
        clearTimeout(this.afkTimer);
        this.afkTimer = setTimeout(this.setUserAway, AWAY_DELAY);
    }


    setUserAway = () => {
        const { user } = this.state;
        if (user.status === STATUS.US_ONLINE) {
            this.setState({
                user: { ...user, status: STATUS.US_AWAY }
            });
        }
        this.sendStatus({ status: STATUS.US_AWAY });
    }

    setUserStatus = defaultStatus => {
        if (defaultStatus === STATUS.US_ONLINE) {
            document.addEventListener("keydown", this.setUserOnlineWhenIdle);
            document.addEventListener("click", this.setUserOnlineWhenIdle);
        }
        else {
            clearInterval(this.afkTimer);
            document.removeEventListener("keydown", this.setUserOnlineWhenIdle);
            document.removeEventListener("click", this.setUserOnlineWhenIdle);
        }

        this.setState({
            user: { ...this.state.user, status: defaultStatus }
        });

        this.sendStatus({ defaultStatus, status: defaultStatus });
    }

    sendStatus(status) {
        this.state.chatSocket.port.postMessage({ type: CHAT_MSG.C_STATUS_CHANGE, data: status });
    }

    createEventSource() {
        const es = new EventSource(ROUTE_EVENTS);
        es.addEventListener("message", this.handleEventSource);
        return es;
    }

    createChatSocket() {
        const ws = createChatSocketWorker();
        ws.port.start();
        ws.port.addEventListener("message", this.handleChatSocket);
        return ws;
    }

    createChessSocket() {
        const ws = createChessSocketWorker();
        ws.port.start();
        return ws;
    }

    handleEventSource = e => {
        const event = JSON.parse(e.data);
        switch (event.type) {
            case SSE.FRIEND_UPDATE:
                this.handleFriendUpate(event);
                break;

            case SSE.REMOVE_FRIEND:
                this.handleRemoveFriend(event);
                break;

            case SSE.FRIEND_REQUEST:
                this.handleFriendRequest(event);
                break;

            case SSE.FRIEND_REQUEST_ACCEPTED:
                this.handleFriendRequestAccepted(event);
                break;

            default:
                break;
        }
    }

    handleFriendUpate(event) {
        const { friendId, changes } = event.data;
        this.setFriendChanges(friendId, changes);
    }

    handleRemoveFriend(event) {
        this.removeFriend(event.data.friendId);
    }

    handleFriendRequest(event) {
        const { notification } = event.data;
        this.setState({
            notifications: [...this.state.notifications, notification],
            friendRequests: [...this.state.friendRequests, notification]
        });
    }

    handleFriendRequestAccepted(event) {
        const { notification, friend } = event.data;
        this.setState({
            notifications: [...this.state.notifications, notification],
            friends: [...this.state.friends, friend]
        });
    }

    handleChatSocket = e => {
        const msg = e.data;

        switch (msg.type) {
            case CHAT_MSG.S_MESSAGE:
                this.handleChatMessage(msg);
                break;

            case CHAT_MSG.S_STATUS_CHANGE:
                this.handleStatusChange(msg);
                break;
        }
    }

    handleChatMessage(msg) {
        if (!this.state.messageTabs.find(tab => tab.chatroomId === msg.data.chatroomId)) {
            const { chatroomId, message } = msg.data;
            this.setState({
                messageTabs: [{
                    chatroomId,
                    unread: 1,
                    partner: message.sender
                },
                ...this.state.messageTabs]
            });
        }
    }

    handleStatusChange(msg) {
        this.setFriendChanges(msg.data.senderId, msg.data.changes);
    }

    setFriendChanges(friendId, changes) {
        const friends = this.state.friends.map(friend => {
            if (friend.id === friendId) {
                Object.assign(friend, changes);
            }
            return friend;
        });

        const messageTabs = this.state.messageTabs.map(tab => {
            if (tab.partner.id === friendId) {
                Object.assign(tab.partner, changes);
            }
            return tab;
        });


        this.setState({ friends, messageTabs });
    }

    removeNotification = notificationId => {
        const notifications = this.state.notifications.filter(notification => notification.id !== notificationId);
        this.setState({ notifications });
    }

    addFriend = friend => {
        const friends = [...this.state.friends, friend];
        this.setState({ friends });
    }

    unfriend = async friendId => {
        const response = await fetch(ROUTE_UNFRIEND(friendId), {
            method: "POST"
        });

        if (response.ok) {
            this.removeFriend(friendId);
            document.dispatchEvent(new CustomEvent("profile_refresh", { detail: { friendId } }));
        }
    }

    removeFriend(friendId) {
        const friends = this.state.friends.filter(friend => friend.id !== friendId);
        const friend = this.state.messageTabs.find(tab => tab.partner.id === friendId);
        const { id } = this.state.user;

        if (friend) {
            let lsTabs = JSON.parse(localStorage.getItem(`messageTabs:${id}`));
            localStorage.setItem(`messageTabs:${id}`, JSON.stringify(lsTabs.filter(tab => tab !== friend.chatroomId)));
        }

        const messageTabs = this.state.messageTabs.filter(tab => tab.partner.id !== friendId);
        this.setState({ friends, messageTabs });
    }

    addMessageTab = newTab => {
        if (!this.state.messageTabs.find(tab => tab.chatroomId === newTab.chatroomId)) {
            const { id } = this.state.user;
            const messageTabIds = JSON.parse(localStorage.getItem(`messageTabs:${id}`));

            if (messageTabIds) {
                if (!messageTabIds.includes(newTab.chatroomId)) {
                    localStorage.setItem(`messageTabs:${id}`, JSON.stringify([...messageTabIds, newTab.chatroomId]));
                }
            }
            else {
                localStorage.setItem(`messageTabs:${id}`, JSON.stringify([newTab.chatroomId]));
            }
            this.setState({ messageTabs: [...this.state.messageTabs, newTab] });
        }
    }

    removeMessageTab = chatroomId => {
        const { id } = this.state.user;
        const messageTabs = this.state.messageTabs.filter(tab => tab.chatroomId !== chatroomId);
        localStorage.setItem(`messageTabs:${id}`, JSON.stringify(messageTabs.map(tab => tab.chatroomId)));
        this.setState({ messageTabs });
    }

    removeFriendRequest = requestId => {
        const friendRequests = this.state.friendRequests.filter(request => request.id !== requestId);
        this.setState({ friendRequests });
    }

    clearUnread = chatroomId => {
        const messageTabs = this.state.messageTabs.map(tab => {
            if (tab.chatroomId === chatroomId) {
                tab.unread = 0;
            }
            return tab;
        });

        this.setState({ messageTabs });
    }

    incrementUnreadMessages = chatroomId => {
        const messageTabs = this.state.messageTabs.map(tab => {
            if (tab.chatroomId === chatroomId) {
                tab.unread += 1;
            }
            return tab;
        });

        this.setState({ messageTabs });
    }

    inviteFriendToPlay = inviteeId => {
        this.state.chessSocket.port.postMessage({ type: CHESS_MSG.C_INVITE, data: { inviteeId } });
    }

    queuePubMatch = type => {
        this.state.chessSocket.port.postMessage({ type: CHESS_MSG.C_QUEUE, data: { type } });
    }

    setFormModal = () => {
        if (this.state.gameModalShown) {
            this.setState({ gameModalShown: false}, () => {
                setTimeout(() => this.setState({ formModalShown: true }), 300);
            });
        }
        else {
            this.setState({ formModalShown: true });
        }
    }

    closeFormModal = () => {
        this.setState({ formModalShown: false });
    }
    
    setGameModal = () => {
        if (this.state.formModalShown) {
            this.setState({ formModalShown: false }, () => {
                setTimeout(() => this.setState({ gameModalShown: true }), 300);
            });
        }
        else {
            this.setState({ gameModalShown: true });
        }
    }
    
    closeGameModal = () => {
        this.setState({ gameModalShown: false });
    }

    render() {
        const {
            user,
            notifications,
            friendRequests,
            friends,
            messageTabs,
            chatSocket,
            chessSocket,
            eventSource,
            formModalShown,
            gameModalShown
        } = this.state;

        const { logout } = this.props;

        return (
            <>
                <Navbar to="/community">
                    <div className="navbar-nav me-auto">
                        <PlayMenu queuePubMatch={this.queuePubMatch} />
                        <Link to={LINK_LEADERBOARD} className="nav-item nav-link">
                            Leaderboard
                        </Link>
                    </div>
                    <NavSearchBar />
                    <div className="navbar-nav">
                        <Notifications
                            notifications={notifications}
                            addFriend={this.addFriend}
                            removeNotification={this.removeNotification}
                            removeFriendRequest={this.removeFriendRequest}
                        />
                        <UserMenu user={user} setUserStatus={this.setUserStatus} logout={logout} />
                    </div>
                </Navbar>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-2 px-0">
                            <MessageBar>
                                {messageTabs.map(tab => (
                                    <Route key={tab.chatroomId} path="/community/myaccount/messages/:id">
                                        {({ match, location }) => (
                                            <MessageTab
                                                partner={tab.partner}
                                                unread={tab.unread}
                                                chatroomId={tab.chatroomId}
                                                closeTab={this.removeMessageTab}
                                                match={match}
                                                incrementUnreadMessages={this.incrementUnreadMessages}
                                                chatSocket={chatSocket}
                                            />
                                        )}
                                    </Route>
                                ))}
                            </MessageBar>
                        </div>
                        <div className="col-8">
                            <Switch>
                                <Route exact path="/community/leaderboard">
                                    <LeaderboardPage itemsPerPage={15} />
                                </Route>
                                <Route exact path="/community/users/search">
                                    <SearchPage itemsPerPage={15} />
                                </Route>
                                <Route exact path="/community/myaccount/settings">
                                    <UserSettingsPage 
                                        user={user} 
                                        setUser={this.setUser} 
                                        logout={logout}
                                        formModalShown={formModalShown}
                                        setFormModal={this.setFormModal}
                                        closeFormModal={this.closeFormModal}
                                    />
                                </Route>
                                <Route exact path="/community/users/:id/matches">
                                    <UserMatches itemsPerPage={10} />
                                </Route>
                                <Route exact path="/community/users/:id/friends">
                                    <UserFriends itemsPerPage={20} />
                                </Route>
                                <Route exact path="/community/users/:id">
                                    <UserProfile
                                        eventSource={eventSource}
                                        unfriend={this.unfriend}
                                        inviteFriendToPlay={this.inviteFriendToPlay}
                                    />
                                </Route>
                                <Route exact path="/community/myaccount/messages/:id">
                                    <ChatWindow
                                        user={user}
                                        chatSocket={chatSocket}
                                        eventSource={eventSource}
                                        addMessageTab={this.addMessageTab}
                                        clearUnread={this.clearUnread}
                                        incrementUnreadMessages={this.incrementUnreadMessages}
                                    />
                                </Route>
                            </Switch>
                        </div>
                        <div className="col-2 px-0">
                            <SocialBar
                                friends={friends}
                                friendRequests={friendRequests}
                                friendList={
                                    friends => (
                                        <FriendList
                                            friends={friends}
                                            inviteFriendToPlay={this.inviteFriendToPlay}
                                            unfriend={this.unfriend}
                                        />
                                    )
                                }
                                pendingList={
                                    friendRequests => (
                                        <PendingList
                                            removeNotification={this.removeNotification}
                                            friendRequests={friendRequests}
                                            removeFriendRequest={this.removeFriendRequest}
                                            addFriend={this.addFriend}
                                        />
                                    )
                                }
                            />
                        </div>
                    </div>
                </div>
                <GameManager
                    userId={user.id}
                    userStatus={user.status}
                    matchIdInProgress={user.matchIdInProgress}
                    setUser={this.setUser}
                    chessSocket={chessSocket}
                    gameModalShown={gameModalShown}
                    setGameModal={this.setGameModal}
                    closeGameModal={this.closeGameModal}
                />

            </>
        );
    }
}

export default withRouter(CommunityPage);
