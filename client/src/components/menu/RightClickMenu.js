import React, { Component } from 'react';
import ReactDOM from "react-dom";
import withAdjustableMenu from './withAdjustableMenu';

class RightClickMenu extends Component {
    render() {
        const { toggler, menuItems, dropdownCaret, menuShown, close, menuRef, x, y, show, dropdownRef } = this.props;

        return (
            <div className="dropdown" role="button" onContextMenu={show} ref={dropdownRef}>
                { dropdownCaret ?
                <div className="d-flex justify-content-between">
                    {toggler}
                    <button className="btn dropdown-toggle dropdown-toggle-split text-muted dropdown-caret" onClick={show}></button>
                </div> :
                    toggler } 
                { ReactDOM.createPortal(
                (<ul ref={menuRef} className={`${menuShown ? "d-block" : "d-none"} dropdown-menu position-absolute shadow`} onClick={close} style={{ left: x, top: y, zIndex: 1000 }}>
                    { menuItems.map((item, index) => (
                        <li key={index}>
                            {item}
                        </li>
                    ))}
                </ul>),
                document.body)}
            </div>
        );
    }
}

export default withAdjustableMenu(RightClickMenu);
