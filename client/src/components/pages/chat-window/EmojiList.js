import React, { Component } from "react";
import { emojis } from "./emojis";
import withMenu from "../../menu/withMenu";

class EmojiList extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
             x: 0,
             y: 0
        };

        this.messageboxAnchorNode = null;
        this.messageboxAnchorOffset = -1;

        this.dropdownRef = React.createRef();
    }
    
    static createEmojis() {
        const res = [];
        let i = 0;
        for (const key in emojis) {
            res.push(
                <span className="emoji fs-4 mx-1 my-1" key={i} title={key}>
                    {emojis[key]}
                </span>
            );
            ++i;
        }

        return res;
    }

    onClick = e => {
        e.preventDefault();
        
        if (!e.target.classList.contains("emoji")) {
            return;
        }

        this.props.messageboxRef.current.focus();

        this.props.insertEmoji(
            e.target.textContent,
            (anchorNode, anchorOffset, text) => {
                const { textContent } = anchorNode;
                const firstHalf = textContent.substring(0, anchorOffset);
                const secondHalf = textContent.substring(
                    anchorOffset,
                    textContent.length
                );
                anchorNode.replaceData(
                    0,
                    textContent.length,
                    firstHalf + text + secondHalf
                );
            },             
        );
    }

    readjustMenuPosition() {
        const menuRect = this.props.menuRef.current.getBoundingClientRect();
        const dropdownRect = this.dropdownRef.current.getBoundingClientRect();

        let x = dropdownRect.x;
        let y = dropdownRect.y;
        
        y -= menuRect.height;
        x -= menuRect.width / 2 - dropdownRect.width / 2;

        this.setState({ x: x - dropdownRect.x, y: y - dropdownRect.y });
    }

    componentDidUpdate(prevProps) {
        if (this.props.menuShown && prevProps.menuShown !== this.props.menuShown) {
            this.readjustMenuPosition();
        }
    }

    render() {
        const { menuShown, show, menuRef } = this.props;
        const { x, y } = this.state;

        return (
            <div className="dropdown ms-2" ref={this.dropdownRef} >
                <div className="fs-4 emoji-list" onClick={show} onFocus={this.onFocus}>&#128515;</div>
                { menuShown &&
                    <div
                        ref={menuRef}
                        onClick={this.onClick}
                        className="dropdown-menu shadow d-flex flex-wrap px-0 py-0 position-absolute moz-scrollbar webkit-scrollbar"
                        style={{ width: 220, height: 200, overflowY: "scroll", left: x, top: y, zIndex: 1000 }}
                    >
                        {EmojiList.createEmojis()}
                    </div>
                }
            </div>
        );
    }
}

export default withMenu(EmojiList);
