import React, { Component } from 'react';
import { Link, Redirect } from "react-router-dom";
import User from "../../user/User";
import * as MSG from "../../../common/message-types/chat-message-types.mjs";
import { LINK_CHAT_WINDOW } from '../../../utils/routes';

class MessageTab extends Component {
    static closeButtonSize = {
        fontSize: "13px"
    };

    static activeTabStyle = {
        backgroundColor: "#e9ecef"
    };

    constructor(props) {
        super(props);

        this.state = {
            redirect: false,
            link: ""
        };
    }

    componentDidMount() {
        if (this.props.chatSocket !== null) {
            this.props.chatSocket.port.addEventListener("message", this.handleSocket);
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.socket !== this.props.chatSocket && this.props.chatSocket !== null) {
            this.props.chatSocket.port.addEventListener("message", this.handleSocket);
        }
    }

    componentWillUnmount() {
        if (this.props.chatSocket !== null) {
            this.props.chatSocket.port.removeEventListener("message", this.handleSocket);
        }
    }

    handleSocket = e => {
        const msg = e.data;
        if (msg.type === MSG.S_MESSAGE) {
            const { chatroomId, match, } = this.props;
            if (msg.data.chatroomId === chatroomId && (match === null || match.params.id !== chatroomId)) {
                this.props.incrementUnreadMessages(this.props.chatroomId);
            }
        }
    }

    onClose = e => {
        e.preventDefault();

        const { match, chatroomId } = this.props;
        if (match && match.params.id === chatroomId) {
            this.setState({ redirect: true, link: "/community" }, () => this.props.closeTab(this.props.chatroomId));
        }
        else {
            this.props.closeTab(this.props.chatroomId);
        }
    }

    render() {
        const { partner, unread, chatroomId, match } = this.props;
        const { redirect, link } = this.state;

        if (redirect) {
            return <Redirect to={link} push />;
        }

        let style = null;
        if (match !== null && match.params.id === chatroomId) {
            style = MessageTab.activeTabStyle;
        }

        return (
            <li className="list-group-item list-group-item-action chat-tab me-0" style={style}>
                <Link to={LINK_CHAT_WINDOW(chatroomId)} className="text-decoration-none text-reset">
                    <div className="d-flex justify-content-between align-items-center">
                        <User name={partner.name} tag={partner.tag} avatar={partner.avatar} status={partner.status} tagonhover statusicon />
                        {unread > 0 &&
                            <div className="badge bg-danger rounded-pill text-white ms-2 me-2">
                                {unread}
                            </div>}
                        <button className="btn-close" style={MessageTab.closeButtonSize} onClick={this.onClose}>
                        </button>
                    </div>
                </Link>
            </li>
        );
    }
}

export default MessageTab;
