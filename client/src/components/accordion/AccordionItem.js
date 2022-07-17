import React, { Component } from 'react';

class AccordionItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: false,
            style: {
                height: 0,
                overflow: "hidden"
            }
        };
        
        this.collapseTimeout = -1;
        this.list = null;
        this.listRef = React.createRef();
    }

    componentDidMount() {
        this.updateHeight();
    }

    componentWillUnmount() {
        clearTimeout(this.collapseTimeout);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.children.length !== this.props.children.length) {
            this.updateHeight();
        }

        if (prevState.collapsed !== this.state.collapsed) {
            const style = {
                ...this.state.style,
                transition: "height .35s ease"
            };

            if (this.state.collapsed) {
                this.setState({ style: { ...style, height: 0 } }, () => {
                    this.collapseTimeout = setTimeout(() => this.setState({ style: { ...this.state.style, display: "none" } }), 350);
                });
            }
            else {
                clearTimeout(this.collapseTimeout);
                this.setState({ style: { ...style, display: "block" } }, () => {
                    this.setState({ style: { ...this.state.style, height: this.calcHeight() } });
                });
            }
        }
    }

    updateHeight() {
        this.setState({ style: { ...this.state.style, height: this.calcHeight() }});
    }

    calcHeight() {
        const children = this.listRef.current.children;
        let height = 0;
        for (const child of children) {
            height += child.offsetHeight;
            const style = getComputedStyle(child);
            height += Number.parseInt(style.getPropertyValue("margin-top"));
            height += Number.parseInt(style.getPropertyValue("margin-bottom"));
        }

        return height;
    }

    toggle = e => {
        this.setState(state => ({ collapsed: !state.collapsed }));
    }

    render() {
        const { title, children } = this.props;
        const { collapsed, style } = this.state;

        return (    
            <div className="accordion-item">
                <h2 className="accordion-header">
                    <div className={`accordion-button py-2 ${collapsed ? "collapsed" : ""}`} role="button" onClick={this.toggle}>
                        {title}
                    </div>
                </h2>
                <ul ref={this.listRef} className="list-group" style={style}>
                    {children}
                </ul>
            </div>
        );
    }
}

export default AccordionItem;
