import React, { Component } from 'react';
import FriendRequest from './FriendRequest';
import withMenu from '../menu/withMenu';
import FriendRequestAccepted from './FriendRequestAccepted';
import { ROUTE_SEE_NOTIFICATION } from '../../utils/routes';

class Notifications extends Component {
    constructor(props) {
        super(props);

        this.state = {
            x: 0,
            unseenCount: 0,
        };

        this.style = {
            zIndex: 1000,
            maxHeight: 400,
            minWidth: 350,
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "rgb(205, 205, 205) rgb(240, 240, 240)"
        }

        this.dropdownRef = React.createRef();
    }

    componentDidUpdate(prevProps) {
        if (this.props.menuShown && this.props.menuShown !== prevProps.menuShown) {
            this.readjustMenuPosition();
        }

        if (prevProps.notifications !== this.props.notifications) {
            const unseenCount = this.props.notifications.reduce((prev, curr) => {
                if (!curr.seen) {
                    return prev + 1;
                }

                return prev;
            }, 0);

            this.setState({ unseenCount });
        }
    }

    readjustMenuPosition() {
        const dropdrownRect = this.dropdownRef.current.getBoundingClientRect();
        const menuRect = this.props.menuRef.current.getBoundingClientRect();

        let x = dropdrownRect.x;
        if (x + menuRect.width > window.innerWidth) {
            x -= x + menuRect.width - window.innerWidth;
        }
        this.setState({ x: x - dropdrownRect.x });
    }

    showNotifications = async e => {
        this.props.show();
        const notificationIds = this.props.notifications.reduce((prev, current) => {
            if (!current.seen) {
                current.seen = 1;
                prev.push(current.id);
            }
            return prev;
        }, []);

        if (notificationIds.length > 0) {
            const responses = await Promise.all(notificationIds.map(id => fetch(ROUTE_SEE_NOTIFICATION(id), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ notificationIds })
            })));

            if (responses.every(response => response.ok)) {
                this.setState({ unseenCount: 0 });
            }
        }
    }

    render() {
        const { menuShown, menuRef, notifications, removeNotification, removeFriendRequest, addFriend } = this.props;
        const { x, unseenCount } = this.state;

        let list = null;
        if (notifications.length === 0) {
            list = <li className="list-group-item text-center pb-3">You have no notifications.</li>
        }
        else {
            list = notifications.map(notification => {
                if (notification.type === "friend_request") {
                    return (
                        <li key={notification.id} className="list-group-item list-group-item-action">
                            <FriendRequest
                                addFriend={addFriend}
                                notification={notification}
                                removeNotification={removeNotification}
                                removeFriendRequest={removeFriendRequest}
                            />
                        </li>
                    );
                }
                else if (notification.type === "friend_request_accepted") {
                    return (
                        <li key={notification.id} className="list-group-item list-group-item-action">
                            <FriendRequestAccepted
                                notification={notification}
                                removeNotification={removeNotification}
                            />
                        </li>
                    );
                }
                return null;
            });
        }

        return (
            <div onClick={this.showNotifications} className="dropdown" ref={this.dropdownRef} >
                <div className="nav-item position-relative" title="Notifications">
                    <i className="bi bi-bell-fill nav-link" role="button"></i>
                    {unseenCount > 0 && <span className="badge rounded-pill position-absolute top-0 start-100 bg-danger">{unseenCount}</span>}
                </div>
                {menuShown &&
                    <ul ref={menuRef} className="list-group position-absolute shadow text-nowrap custom-scrollbar" style={{ left: x, ...this.style }}>
                        <li className="list-group-item">
                            <h5>Notifications</h5>
                        </li>
                        {list}
                    </ul>
                }
            </div>
        );
    }
}

export default withMenu(Notifications);
