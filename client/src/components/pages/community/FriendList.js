import React, { Component } from 'react';
import AccordionItem from '../../accordion/AccordionItem';
import Accordion from "../../accordion/Accordion";
import OnlineUser from '../../user/OnlineUser';
import OfflineUser from '../../user/OfflineUser';
import { US_OFFLINE } from "../../../common/user-statuses.mjs";
import TimeUpdater from '../../TimeUpdater';

class FriendList extends Component {
    render() {
        const { friends, inviteFriendToPlay, unfriend } = this.props;
        const online = friends.filter(friend => friend.status !== US_OFFLINE);
        const offline = friends.filter(friend => friend.status === US_OFFLINE);

        const noOnlineFriends = (
            <div className="text-center py-2">
                No online friends.
            </div>
        );

        const noOfflineFriends = (
            <div className="text-center py-2">
                No offline friends.
            </div>
        );

        return (
            <div className="friend-list">
                <Accordion>
                    <AccordionItem title="Online">
                        {online.length > 0 ?
                            online.map(friend => (
                                <OnlineUser
                                    key={friend.id}
                                    id={friend.id}
                                    chatroomId={friend.chatroomId}
                                    name={friend.name}
                                    tag={friend.tag}
                                    avatar={friend.avatar}
                                    status={friend.status}
                                    statusText={friend.statusText}
                                    inviteFriendToPlay={inviteFriendToPlay}
                                    unfriend={unfriend}
                                />)) :
                            noOnlineFriends}
                    </AccordionItem>
                    <AccordionItem title="Offline">
                        {offline.length > 0 ?
                            offline.map(friend => (
                                <TimeUpdater key={friend.id} date={friend.lastOnline}>
                                    {time => (
                                        <OfflineUser
                                            id={friend.id}
                                            chatroomId={friend.chatroomId}
                                            name={friend.name}
                                            tag={friend.tag}
                                            avatar={friend.avatar}
                                            statusText={`Last online ${time}`}
                                            unfriend={unfriend}
                                        />)}
                                </ TimeUpdater>
                            )) :
                            noOfflineFriends}
                    </AccordionItem>
                </Accordion>
            </div>
        );
    }
}

export default FriendList;
