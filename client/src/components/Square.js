import React, { Component } from "react";

class Square extends Component {
    render() {
        const { className } = this.props;

        return (
            <div
                className={`${className} rounded me-2`}
                style={{ width: 20, height: 20 }}
            ></div>
        );
    }
}

export default Square;
