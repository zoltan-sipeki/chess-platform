import React, { Component } from 'react';

function withMenu(WrappedComponent) {
    return class extends Component {
        constructor(props) {
            super(props);
            
            this.state = {
                menuShown: false,
            };

            this.menu = React.createRef();
        }
    
        show = e => {
            if (this.state.menuShown) {
                return;
            }

            this.setState({
                menuShown: true,
            });

            document.addEventListener("mousedown", this.hide);
        }
    
        close = e => {
            this.setState({ menuShown: false });
            document.removeEventListener("mousedown", this.hide);
        }
    
        hide = e => {
            if (this.menu.current.contains(e.target)) {
                return;
            }
            this.close(e);
        }

        render() {
            const { menuShown} = this.state;

            return (
                <WrappedComponent 
                    {...this.props} 
                    menuShown={menuShown}
                    show={this.show} 
                    close={this.close} 
                    menuRef={this.menu} 
                />
            );
        }
    }
}

export default withMenu;
