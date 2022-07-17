import React, { Component } from "react";
import { Transition } from "react-transition-group";

const FADE_TIMEOUT = 300;

class Modal extends Component {
    constructor(props) {
        super(props);

        this.transitions = {
            entering: "show",
            entered: "show",
            exiting: "",
            exited: ""
        };

        this.state = {
            className: ""
        }

        this.animating = false;
        this.timeOut = -1;
        this.modalRef = React.createRef();
        this.backdropRef = React.createRef();
    }


    onEnter = () => {
        document.addEventListener(
            "modal.closebutton",
            this.props.onClose
        );
        this.modalRef.current.focus();
        document.body.style.setProperty("overflow", "hidden");

        // return this.ref.current.offsetHeight;
    }

    onExited = () => {
        document.body.style.removeProperty("overflow");
        document.removeEventListener(
            "modal.closebutton",
            this.props.onClose
        );
    }

    onClick = e => {
        if (e.target === this.modalRef.current) {
            if (this.props.static) {
                this.setStaticAnimation();
            }
            else {
                this.props.onClose(e);
            }
        }
    }

    setStaticAnimation() {
        if (this.animating) {
            return;
        }
        this.animating = true;
        this.setState({ className: "modal-static" });
        setTimeout(() => {
            this.setState({ className: "" })
            setTimeout(() => this.animating = false, FADE_TIMEOUT);
        }, FADE_TIMEOUT);
    }

    onKeyDown = e => {
        if (e.key === "Escape") {
            if (this.props.static) {
                this.setStaticAnimation();
            }
            else {
                this.props.onClose(e);
            }
        }
    }

    render() {
        const { show, children } = this.props;
        const { className } = this.state;

        return (
            <>
                <Transition
                    in={show}
                    nodeRef={this.modalRef}
                    timeout={FADE_TIMEOUT}
                    onEnter={this.onEnter}
                    onExited={this.onExited}
                    mountOnEnter
                    unmountOnExit
                >
                    {(state) => (
                        <div
                            onClick={this.onClick}
                            onKeyDown={this.onKeyDown}
                            ref={this.modalRef}
                            className={`modal fade d-block ${this.transitions[state]} ${className}`}
                            tabIndex={-1}
                        >
                            <div className="modal-dialog modal-lg">
                                <div className="modal-content">
                                    {children}
                                </div>
                            </div>
                        </div>
                    )}
                </Transition>
                <Transition
                    in={show}
                    timeout={150}
                    nodeRef={this.backdropRef}
                    mountOnEnter
                    unmountOnExit
                >
                    {(state) => (
                        <div ref={this.backdropRef}
                            className={`modal-backdrop fade ${this.transitions[state]}`}
                        ></div>
                    )}
                </Transition>
            </>
        );
    }
}

export default Modal;
