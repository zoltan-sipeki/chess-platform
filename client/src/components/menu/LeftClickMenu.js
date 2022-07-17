import React, { Component } from 'react';
import withMenu from "./withMenu";

class LeftClickMenu extends Component {
    render() {
        const { toggler, menuItems, className, menuShown, show, close, menuRef } = this.props;

        return (
            <div className="dropdown" onClick={show} role="button">
                {toggler}
                <ul ref={menuRef} onClick={close} className={`${menuShown ? "d-block" : "d-none"} dropdown-menu shadow ${className}`}>
                    { menuItems.map((item, index) => (
                        <li key={index}>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
}

export default withMenu(LeftClickMenu);