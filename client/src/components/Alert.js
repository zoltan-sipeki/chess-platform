import React, { Component } from 'react';
import { Transition  } from 'react-transition-group';

const FADE_TIMEOUT = 5000;

export class Alert extends Component {
    constructor(props) {
        super(props);

        this.style = {
            top: "5%"
        };

        this.transitions = {
            entering: "show",
            entered: "show",
            exiting: "",
            exited: ""
        };

        this.timer = -1;
    }

    componentDidUpdate() {
        if (this.timer !== -1) {
            clearTimeout(this.timer);
            this.onEntered();
        }
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
    }

    onEnter = node => {
        return node.offsetHeight;
    }

    onEntered = () => {
        this.timer = setTimeout(() => {
           this.props.onClose();
           this.timer = -1;
        }, FADE_TIMEOUT);
    }

    onExited = () => {
        clearInterval(this.timer);
    }
    
    render() {
        const { type, children, show, onClose, className } = this.props;

        return (
            <Transition
                in={show}
                timeout={150}
                onEnter={this.onEnter}
                onEntered={this.onEntered}
                onExited={this.onExited}
                mountOnEnter
                unmountOnExit
            >
                { state =>  (
                    <div style={this.style} className={`text-center alert alert-dismissible ${this.transitions[state]} fade shadow alert-${type} ${className}`}>
                        {children}
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                )}
            </Transition>
        );
    }
}

export default Alert;
