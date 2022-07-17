import React, { Component } from "react";
import { Transition } from "react-transition-group";
import Square from "../../Square";

class Toast extends Component {
    constructor(props) {
        super(props);
        this.state = {
            x: 0,
            y: 0
        };

        this.toastRef = React.createRef();
        this.dragging = false;
        this.prevMouseX = 0;
        this.prevMouseY = 0;

        this.transitions = {
            entering: "show showing",
            entered: "show",
            exiting: "show showing",
            exited: "hide"
        };
    }

    startDragging = (e) => {
        this.dragging = true;
        this.prevMouseX = e.clientX;
        this.prevMouseY = e.clientY;
        document.addEventListener("mousemove", this.drag);
    };

    drag = (e) => {
        if (!this.drag) {
            return;
        }

        const dx = e.clientX - this.prevMouseX;
        const dy = e.clientY - this.prevMouseY;
        this.setState((state) => {
            return { x: state.x - dx, y: state.y - dy };
        });

        this.prevMouseX = e.clientX;
        this.prevMouseY = e.clientY;
    };

    stopDragging = (e) => {
        this.dragging = false;
        document.removeEventListener("mousemove", this.drag);
    };

    render() {
        const { x, y } = this.state;
        const { header, children, show, close } = this.props;

        return (
            <Transition in={show} timeout={150} nodeRef={this.toastRef} mountOnEnter unmountOnExit>
                {(state) => (
                    <div
                        ref={this.toastRef}
                        className={`toast fade mb-3 me-3 position-fixed ${this.transitions[state]}`}
                        style={{ right: x, bottom: y }}
                    >
                        <div
                            className="toast-header"
                            onMouseDown={this.startDragging}
                            onMouseUp={this.stopDragging}
                        >
                            <Square className="bg-info" />
                            <strong className="me-auto">{header}</strong>
                            {close && <button className="btn-close" onClick={close}></button>}
                        </div>
                        <div className="toast-body d-flex justify-content-between align-items-center pe-4">
                            {children}
                        </div>
                    </div>
                )}
            </Transition>
        );
    }
}

export default Toast;