import React, { Component } from 'react';

export class VPContainer extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
            style: {
                maxHeight: 0
            }
        };

        this.container = React.createRef();
    }

    componentDidMount() {
        window.addEventListener("resize", this.onResize);
        this.onResize();
    }
    
    componentWillUnmount() {
        window.removeEventListener("resize", this.onResize);
    }

    onResize = e => {
        const rect = this.container.current.getBoundingClientRect();
        this.setState(state => ({ style: {...state.style, maxHeight: window.innerHeight - rect.top }}));
    }
    
    render() {
        const { children, className } = this.props;
        const { style } = this.state;

        return (
            <div ref={this.container} className={`webkit-scrollbar moz-scrollbar ${className}`} style={style}>
                { children }
            </div>
        );
    }
}

export default VPContainer;