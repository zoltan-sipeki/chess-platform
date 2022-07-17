import React, { Component } from "react";
import EmojiList from "./EmojiList";
import MessageContainer from "./MessageContainer";
import { replaceEmojis } from "./replace-emojis";
import * as MSG from "../../../common/message-types/chat-message-types.mjs";
import { US_OFFLINE } from "../../../common/user-statuses.mjs";
import { withRouter } from "react-router-dom";
import User from "../../user/User";
import NewMessage from "./NewMessage";
import Message from "./Message";
import { v4 as UUID } from "uuid";
import TimeUpdater from "../../TimeUpdater";
import { Link } from "react-router-dom";
import Spinner from "../../Spinner";
import VPContainer from "../../VPContainer";
import ChatTimeStamp from "./ChatTimeStamp";
import * as SSE from "../../../common/message-types/sse-messages-types.mjs";
import { Redirect } from "react-router-dom/cjs/react-router-dom.min";
import { LINK_COMMUNITY, ROUTE_MESSAGES, ROUTE_CHAT_PARTNER } from "../../../utils/routes";

const style = {
    height: 450,
    whiteSpace: "pre-line"
};

const PAGE_SIZE = 30;
const TYPING_DELAY = 10000;
const SCROLL_DELAY = 200;

class ChatWindow extends Component {
    constructor(props) {
        super(props);

        this.state = {
            partner: {},
            messages: [],
            typer: "",
            redirect: false
        };


        this.canFetch = true;
        this.typingTimeout = -1;
        this.firstLoad = true;
        this.everythingLoaded = false;
        this.canSendTyping = true;
        this.cursorNode = null;
        this.cursorOffset = -1;

        this.messagebox = React.createRef();
        this.messagewindow = React.createRef();
    }

    componentDidMount() {
        if (this.props.chatSocket !== null) {
            this.props.chatSocket.port.addEventListener("message", this.handleSocket);
        }
        if (this.props.eventSource !== null) {
            this.props.eventSource.addEventListener("message", this.handleEventSource);
        }

        document.addEventListener("profile_refresh", this.onUnfriend);
        this.loadChatWindow();
    }

    getSnapshotBeforeUpdate(prevProps, prevState) {
        const scrollHeight = this.messagewindow.current.scrollHeight;
        const scrollTop = this.messagewindow.current.scrollTop;
        return { scrollHeight, scrollTop };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.messages !== this.state.messages) {
            if (this.firstLoad) {
                this.firstLoad = false;
                this.messagewindow.current.scrollTop =
                    this.messagewindow.current.scrollHeight -
                    this.messagewindow.current.clientHeight;
                }
            else {
                this.messagewindow.current.scrollTop = snapshot.scrollTop + this.messagewindow.current.scrollHeight - snapshot.scrollHeight;
            }
        }

        if (prevProps.match.params.id !== this.props.match.params.id) {
            this.resetComponent();
        }

        if (prevProps.chatSocket !== this.props.chatSocket && this.props.chatSocket !== null) {
            this.props.chatSocket.port.addEventListener("message", this.handleSocket);
        }

        if (prevProps.eventSource !== this.props.eventSource && this.props.eventSource !== null) {
            this.props.eventSource.addEventListener("message", this.handleEventSource);
        }

    }

    componentWillUnmount() {
        if (this.props.chatSocket !== null) {
            this.props.chatSocket.port.removeEventListener("message", this.handleSocket);
        }
        if (this.props.eventSource !== null) {
            this.props.eventSource.removeEventListener("message", this.handleEventSource);
        }

        document.removeEventListener("profile_refresh", this.onUnfriend);
        clearTimeout(this.typingTimeout);
    }

    resetComponent() {
        this.setState({
            partner: {},
            messages: [],
            typer: "",
            redirect: false
        });

        clearTimeout(this.typingTimeout);
        this.firstLoad = true;
        this.canFetch = true;
        this.everythingLoaded = false;
        this.canSendTyping = true;
        this.cursorNode = null;
        this.cursorOffset = -1;
        this.loadChatWindow();
    }

    loadChatWindow() {
        Promise.all([this.fetchPartner(), this.fetchMessages(1)]).then(result => {
            const tab = {
                chatroomId: this.props.match.params.id,
                partner: this.state.partner,
                unread: 0
            };

            this.props.addMessageTab(tab);
            this.props.clearUnread(this.props.match.params.id);
        });
    }

    clearTyper = () => {
        if (this.state.typer !== "") {
            this.setState({ typer: "" });
        }
    }

    async fetchPartner() {
        const response = await fetch(ROUTE_CHAT_PARTNER(this.props.match.params.id));
        if (response.ok) {
            const partner = await response.json();
            this.setState({ partner });
        }
    }

    async fetchMessages(page) {
        if (this.everythingLoaded) {
            return;
        }
        const response = await fetch(ROUTE_MESSAGES(this.props.match.params.id, page, PAGE_SIZE));

        if (response.ok) {
            const messages = await response.json();
            if (messages.length === 0) {
                this.everythingLoaded = true;
            }

            this.setState(state => ({
                messages: [...messages, ...state.messages]
            }));
        }
    }

    handleEventSource = e => {
        const event = JSON.parse(e.data);
        switch (event.type) {
            case SSE.REMOVE_FRIEND:
                this.redirect(event.data.friendId);
                break;

            case SSE.FRIEND_UPDATE:
                this.handleFriendUpdate(event);
                break;

            default:
                break;
        }
    }

    onUnfriend = e => {
        this.redirect(e.detail.friendId);
    }

    redirect(friendId) {
        if (friendId === this.state.partner.id) {
            this.setState({ redirect: true });
        }
    }

    handleFriendUpdate(event) {
        const { friendId, changes } = event.data;
        if (this.state.partner.id === friendId) {
            const messages = this.state.messages.map(message => {
                if (message.sender.id === friendId) {
                    Object.assign(message.sender, changes);
                }
                return message;
            });
            this.setState({ partner: Object.assign(this.state.partner, changes), messages });
        }
    }

    handleSocket = e => {
        const msg = e.data;
        
        switch (msg.type) {
            case MSG.S_MESSAGE:
                this.handleChatMessage(msg);
                break;

            case MSG.S_STATUS_CHANGE:
                this.handleStatusChange(msg);
                break;

            case MSG.S_TYPING:
                this.handleTyping(msg);
                break;

            default:
                break;
        }
    }

    handleChatMessage(msg) {
        if (msg.data.chatroomId === this.props.match.params.id) {
            clearTimeout(this.typingTimeout);
            this.setState(state => ({
                messages: [...state.messages, msg.data.message],
                typer: ""
            }));
            this.sendMessageSeen();
        }
    }

    handleStatusChange(msg) {
        if (this.state.partner.id === msg.data.senderId) {
            const partner = { ...this.state.partner };
            Object.assign(partner, msg.data.changes);
            this.setState({ partner });
        }
    }

    handleTyping(msg) {
        if (this.props.match.params.id === msg.data.chatroomId) {
            clearTimeout(this.typingTimeout);
            if (this.state.typer === "") {
                this.setState({ typer: msg.data.name });
            }
            this.typingTimeout = setTimeout(this.clearTyper, TYPING_DELAY);
        }
    }

    sendMessage = e => {
        const messagebox = this.messagebox.current;
        if (messagebox.innerText !== "\n" && messagebox.innerText !== "") {
            this.props.chatSocket.port.postMessage({
                type: MSG.C_MESSAGE,
                data: {
                    text: messagebox.innerText,
                    chatroomId: this.props.match.params.id
                }
            });
            messagebox.innerText = "";
        }
    }

    sendTypingMessage() {
        this.props.chatSocket.port.postMessage({
            type: MSG.C_TYPING,
            data: {
                chatroomId: this.props.match.params.id
            }
        });
    }

    sendMessageSeen() {
        const { user } = this.props;
        const { messages } = this.state;
        const top = messages[messages.length - 1];

        if (top.sender.id !== user.id) {
            this.props.chatSocket.port.postMessage({ type: MSG.C_MESSAGE_SEEN, data: top.id });
        }
    }

    replaceEmojis = () => {
        const textNodes = getTextNodes(this.messagebox.current);
        const selection = document.getSelection();

        for (const textNode of textNodes) {
            const result = replaceEmojis(textNode.textContent);

            if (result.pos === -1) {
                continue;
            }

            textNode.replaceData(0, textNode.textContent.length, result.newText);

            if (textNode !== selection.anchorNode) {
                continue;
            }

            const range = new Range();
            const { replacement, pos } = result;
            range.setStart(textNode, replacement.length + pos);

            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

    insertText = (text, callback, node, offset) => {
        if (document.activeElement !== this.messagebox.current) {
            return;
        }
        const selection = document.getSelection();
        const anchorNode = this.cursorNode ?? selection.anchorNode;
        const anchorOffset = this.cursorOffset === -1 ? selection.anchorOffset : this.cursorOffset;
        selection.setBaseAndExtent(anchorNode, anchorOffset, anchorNode, anchorOffset);

        const range = new Range();

        if (anchorNode.nodeType !== Node.TEXT_NODE) {
            const textNode = new Text(text);
            if (anchorOffset > 0) {
                anchorNode.childNodes[anchorOffset - 1].after(textNode);
            }
            else {
                anchorNode.prepend(textNode);
            }
            range.setStart(textNode, text.length);
        }
        else {
            callback(anchorNode, anchorOffset, text);
            range.setStart(anchorNode, anchorOffset + text.length);
        }

        selection.removeAllRanges();
        selection.addRange(range);
        this.setCursor();
    }

    onPaste = e => {
        const text = e.clipboardData.getData("text/plain");

        if (text === "") {
            e.preventDefault();
            return;
        }

        const result = replaceEmojis(text);
        if (result.pos !== -1) {
            e.preventDefault();

            this.insertText(result.newText, (anchorNode, anchorOffset, text) => {
                anchorNode.insertData(anchorOffset, text);
            });
        }
    }

    onScroll = e => {
        const { scrollHeight, scrollTop } = this.messagewindow.current;
        if (scrollHeight > 0 && scrollTop <= scrollHeight * 0.1) {
            const page = Math.ceil(this.state.messages.length / PAGE_SIZE) + 1;

            if (this.canFetch) {
                this.fetchMessages(page);
                this.canFetch = false;
                setTimeout(() => { this.canFetch = true; }, SCROLL_DELAY);
            }
        }
    }

    onKeyDown = e => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage(e);
        }
        else {
            if (this.canSendTyping) {
                this.sendTypingMessage();
                this.canSendTyping = false;
                setTimeout(() => this.canSendTyping = true, TYPING_DELAY - 1000);
            }
        }

        setTimeout(this.replaceEmojis, 1);
    }

    onKeyUp = e => {
        if (e.key === "Enter" && !e.shiftKey) {
            return;
        }

        if (e.target.innerText === "\n") {
            e.target.innerText = "";
        }

        this.setCursor();
    }

    onClick = e => {
        this.setCursor();
    }

    setCursor() {
        const selection = document.getSelection();
        this.cursorNode = selection.anchorNode;
        this.cursorOffset = selection.anchorOffset;
    }

    renderMessages() {
        const { messages } = this.state;
        const result = [];

        for (let i = 0; i < messages.length; ++i) {
            if (messages[i].seen != null && !messages[i].seen && (i === 0 || messages[i - 1].seen == null || messages[i - 1].seen)) {
                result.push(<NewMessage key={UUID()} />);
            }

            if (i === 0 || new Date(messages[i].createdAt).getDate() !== new Date(messages[i - 1].createdAt).getDate()) {
                result.push(<ChatTimeStamp key={UUID()} date={messages[i].createdAt} />)
            }

            let containerProps = {
                sender: messages[i].sender,
                createdAt: messages[i].createdAt,
                messages: [<Message key={messages[i].id} message={messages[i]} />]
            }

            while (i < messages.length - 1 && messages[i].sender.id === messages[i + 1].sender.id) {
                const hasSeen = !messages[i].seen || messages[i + 1].seen == null || messages[i + 1].seen; // messages[i].seen && messages[i + 1].seen != null && !messages[i + 1].seen
                const sameDay = new Date(messages[i].createdAt).getDate() === new Date(messages[i + 1].createdAt).getDate();

                if (!hasSeen || !sameDay) {
                    result.push(
                        <MessageContainer
                            key={UUID()}
                            sender={containerProps.sender}
                            createdAt={containerProps.createdAt}>
                            {containerProps.messages}
                        </MessageContainer>
                    );

                    if (!hasSeen) {
                        result.push(<NewMessage key={UUID()} />);
                    }

                    if (!sameDay) {
                        result.push(<ChatTimeStamp key={UUID()} date={messages[i + 1].createdAt} />);
                    }

                    containerProps = {
                        sender: messages[i + 1].sender,
                        createdAt: messages[i + 1].createdAt,
                        messages: [<Message key={messages[i + 1].id} message={messages[i + 1]} />]
                    }
                }
                else {
                    containerProps.messages.push(
                        <Message key={messages[i + 1].id} message={messages[i + 1]} />
                    );
                }
                ++i;
            }

            result.push(
                <MessageContainer
                    key={UUID()}
                    sender={containerProps.sender}
                    createdAt={containerProps.createdAt}>
                    {containerProps.messages}
                </MessageContainer>
            );
        }

        return result;
    }

    render() {
        const { partner, typer, redirect } = this.state;
        const { loading } = this.props;

        if (redirect) {
            return <Redirect to="/community" />;
        }

        const partnerProps = {
            nameSize: 25,
            avatarSize: 50,
            name: partner.name,
            tag: partner.tag,
            avatar: partner.avatar,
            status: partner.status,
            statusicon: true
        }

        let user = null;
        if (partner.status === US_OFFLINE) {
            user = (
                <TimeUpdater date={partner.lastOnline}>
                    {time => <User {...partnerProps} statustext={`Last online ${time}`} />}
                </TimeUpdater>
            );
        }
        else {
            user = <User {...partnerProps} statustext={partner.statusText} />
        }

        return (
            <VPContainer className="container pt-3">
                <div className="d-flex justify-content-between align-items-center px-2 pb-3 border-bottom border-2">
                    {user}
                    <Link to={LINK_COMMUNITY} className="btn btn-close"></Link>
                </div>
                <div
                    style={style}
                    className="my-1 d-flex flex-column justify-content-end"
                >
                    <div className="d-flex flex-shrink-1" style={{ minHeight: 0 }}>
                        <div
                            onScroll={this.onScroll}
                            ref={this.messagewindow}
                            className="flex-shrink-1 w-100 moz-scrollbar webkit-scrollbar"
                        >
                            {loading ? <Spinner /> : <div style={{ height: 32 }}></div>}
                            {this.renderMessages()}
                        </div>
                    </div>
                </div>
                <div className="d-flex messagebox my-2">
                    <div
                        style={{ whiteSpace: "breaks-spaces", wordBreak: "break-word" }}
                        ref={this.messagebox}
                        onKeyDown={this.onKeyDown}
                        onKeyUp={this.onKeyUp}
                        onClick={this.onClick}
                        onPaste={this.onPaste}
                        onBlur={this.onBlur}
                        contentEditable="true"
                        className="form-control bg-light"
                    ></div>
                    <EmojiList insertEmoji={this.insertText} messageboxRef={this.messagebox} />
                    <button className="btn btn-primary ms-2" onClick={this.sendMessage}>Send</button>
                </div>
                {typer !== "" &&
                    <div className="ps-1 form-text d-flex align-items-center">
                        <div
                            className="spinner-grow me-2"
                            style={{ width: 8, height: 8 }}
                        ></div>
                        <div>{`${typer} is typing a message...`}</div>
                    </div>}
            </VPContainer>
        );
    }
}

function getTextNodes(element) {
    const nodes = [];

    function helper(element) {
        for (const child of element.childNodes) {
            if (child.nodeType === Node.TEXT_NODE) {
                nodes.push(child);
            } else {
                helper(child);
            }
        }
    }

    helper(element);
    return nodes;
}

export default withRouter(ChatWindow);