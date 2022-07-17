import React, { Component } from 'react';
import withMenu from './withMenu';

function withAdjustableMenu (WrappedComponent) {
    class WithAdjustableMenu extends Component {
        constructor(props) {
            super(props);
    
            this.state = {
                x: 0,
                y: 0
            };

            this.mouseX = 0;
            this.mouseY = 0;

            this.dropdownRef = React.createRef();
        }
    
        show = e => {
            e.preventDefault();
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.props.show(e);
        }
    
        readjustMenuPosition() {
            const { menuRef } = this.props;

            const width = menuRef.current.offsetWidth;
            const height = menuRef.current.offsetHeight;

            const dropdownRect = document.body.getBoundingClientRect();
    
            let x = this.mouseX;
            let y = this.mouseY + 3;
    
            if (x + width > window.innerWidth) {
                x -=  x + width - window.innerWidth;
            }
            if (y + height > window.innerHeight) {
                y -= height;
            }
    
            this.setState({ x: x - dropdownRect.x, y: y - dropdownRect.y });
        }
    
        componentDidUpdate(prevProps) {
            if (this.props.menuShown && prevProps.menuShown !== this.props.menuShown) {
                this.readjustMenuPosition();
            }
        }

        render() {
            const { x, y } = this.state;

            return (
                <WrappedComponent 
                    {...this.props}
                    show={this.show}
                    x={x}
                    y={y}
                    dropdownRef={this.dropdownRef}
                />
            );
        }
    };

    return withMenu(WithAdjustableMenu);
}


export default withAdjustableMenu;
