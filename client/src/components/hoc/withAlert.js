import React, { Component } from 'react';

function withAlert(WrappedComponent) {
    return class WithAlert extends Component {
        constructor(props) {
            super(props);
        
            this.state = {
                 show: false,
                 type: "",
                 content: null
            };
        }

        showAlert = (content, type) => {
            this.setState({ show: true, content, type });
        }

        closeAlert = () => {
            this.setState({ show: false });
        }
        
        render() {
            const { show, content, type } = this.state;

            return (
                <WrappedComponent
                    {...this.props}
                    alertVisible={show}
                    alertContent={content}
                    alertType={type}
                    showAlert={this.showAlert}
                    closeAlert={this.closeAlert}
                />
            );
        }
    };
}

export default withAlert;
