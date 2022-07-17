import React, { Component } from 'react';

export class Avatar extends Component {
    render() {
        const { src } = this.props;

        return (
            <div className="d-flex justify-content-center">
                <img
                    className="rounded-circle"
                    width="200"
                    height="200"
                    src={src}
                    alt=""
                />
            </div>
        );
    }
}

export default Avatar;
