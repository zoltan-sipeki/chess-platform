import React, { Component } from 'react';
import UserLink from '../../user/UserLink';
import { stringifyDate } from "../../../utils/time";

class MessageContainer extends Component {
    static dateFontSize = {
        fontSize: "12px"
    };

    render() {
        const { children, sender, createdAt } = this.props;

        return (
            <div className="mb-3">
                <div className="d-flex align-items-center">
                    <UserLink name={sender.name} tag={sender.tag} avatar={sender.avatar} id={sender.id} />
                    <div className="text-muted ms-2" style={MessageContainer.dateFontSize}>{stringifyDate(new Date(createdAt))}</div>
                </div>
                <div>
                    {children}
                </div>
            </div>
        );
    }
}

export default MessageContainer;
