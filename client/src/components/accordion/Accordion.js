import React, { Component } from 'react';
import VPContainer from "../VPContainer";

class Accordion extends Component {
    render() {
        const { children } = this.props;
        return (
            <VPContainer>
                <div className="accordion w-100">
                    {children}
                </div>
            </VPContainer>
        );
    }
}

export default Accordion;
