import React, { Component } from 'react';
import { toAgoString, timeElapsedSince, MINUTE } from '../utils/time';

class TimeUpdater extends Component {
    constructor(props) {
        super(props)
        
        this.date = new Date(this.props.date);
        this.timer = -1;
        this.state = {
             time: ""
        };

    }

    componentDidMount() {
        this.timer = setInterval(this.updateStatusText);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.date !== this.props.date) {
            clearInterval(this.timer);
            this.date = new Date(this.props.date);
            this.timer = setInterval(this.updateStatusText);
        }
    }

    updateStatusText = () => {
        clearInterval(this.timer);
        const { value, unit } = timeElapsedSince(this.date);
        
        if (unit.text === "now") {
            this.timer = setInterval(this.updateStatusText, unit.ms * 10);
        }
        else if (unit.text === "second") {
            this.timer = setInterval(this.updateStatusText, unit.ms * 10);
        }
        else if (unit.text === "minute") {
            if (value < 10) {
                this.timer = setInterval(this.updateStatusText, unit.ms);
            }
            else {
                this.timer = setInterval(this.updateStatusText, unit.ms * 5);
            }
        }
        else {
            this.timer = setInterval(this.updateStatusText, MINUTE.ms * 10);
        }

        this.setState({
            time: toAgoString(this.date)
        });
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    render() {
        const { children } = this.props;
        const { time } = this.state;

        return (
            children(time)
        );
    }
}

export default TimeUpdater

