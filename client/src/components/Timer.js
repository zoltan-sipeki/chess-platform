import React, { Component } from "react";
import TimeStamp from "./TimeStamp";

class Timer extends Component {
    constructor(props) {
        super(props);

        const now = Date.now();

        this.state = {
            time: props.countDownTo
                ? props.countDownTo - now
                : 0
        };

        this.lastTime = now;
        this.elapsed = 0;
        this.timer = -1;
        this.tick = this.props.countDownTo ? this.countDown : this.countUp;
    }

    componentDidMount() {
        this.start();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.countDownTo !== this.props.countDownTo) {
            if (this.props.countDownTo) {
                this.tick = this.countDown;
                this.setState({
                    time: this.props.countDownTo - Date.now()
                });
            }
            else {
                this.tick = this.countUp;
                this.setState({ time: 0 });
            }
            this.start();
        }
    }

    componentWillUnmount() {
        this.stop();
    }

    start() {
        this.timer = setInterval(this.tick, 1000);
    }

    stop() {
        clearInterval(this.timer);
    }

    countDown = () => {
        const diff = this.props.countDownTo - Date.now();
        if (diff <= 0) {
            this.stop();
        } else {
            this.setState({ time: diff });
        }
    };

    countUp = () => {
        const now = Date.now();
        const diff = now - this.lastTime;
        this.elapsed += diff;
        this.lastTime = now;

        this.setState({ time: this.elapsed });
    };

    render() {
        const { time } = this.state;
        const { className } = this.props;

        return (
            <TimeStamp className={className} time={time} />
        );
    }
}

export default Timer;

