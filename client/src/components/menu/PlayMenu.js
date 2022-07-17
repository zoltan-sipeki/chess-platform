import React, { Component } from 'react';
import LeftClickMenu from "./LeftClickMenu";
import MenuDivider from './MenuDivider';

class PlayMenu extends Component {
    enqueueRanked = (e) => {
        this.props.queuePubMatch("ranked");
    }

    enqueueUnranked = e => {
        this.props.queuePubMatch("unranked");
    }

    render() {
        const toggler = (
            <div className="nav-item me-3" >
                <div className="nav-link dropdown-toggle" role="button">
                    Play
                </div>
            </div>
        );

        const menuItems = [
            <button className="dropdown-item" onClick={this.enqueueRanked}>Ranked</button>,
            <MenuDivider />,
            <button className="dropdown-item" onClick={this.enqueueUnranked}>Unranked</button>
        ];

        return (
            <LeftClickMenu toggler={toggler} menuItems={menuItems} />
        );
    }
}

export default PlayMenu;
