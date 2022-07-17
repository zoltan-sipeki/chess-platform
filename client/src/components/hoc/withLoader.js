import React, { Component } from "react";

export default function withLoader(WrappedComponent) {
    return class WithLoader extends Component {
        constructor(props) {
            super(props);
            this.state = {
                loading: false
            };
        }

        setLoading = loading => {
            this.setState({ loading });
        }

        render() {
            const { loading } = this.state;

            return (
                <WrappedComponent
                    {...this.props}
                    loading={loading}
                    setLoading={this.setLoading}
                />
            );
        }
    };
}
