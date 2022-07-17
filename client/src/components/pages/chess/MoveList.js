import React, { Component } from "react";

class MoveList extends Component {
    constructor(props) {
        super(props);

        this.listRef = React.createRef();
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.moves !== this.props.moves
        ) {
            this.listRef.current.scrollTop =
                this.listRef.current.scrollHeight - this.listRef.current.clientHeight;
        }
    }

    createList() {
        const { moves } = this.props;

        const list = [];
        for (let i = 0; i < moves.length; i += 2) {
            list.push(
                <li key={i} className="mb-1">
                    <div className="d-flex ms-2">
                        <div style={{ width: 100 }}>
                            <div>{moves[i].toString()}</div>
                        </div>
                        {i + 1 < moves.length && (
                            <div style={{ width: 100 }}>
                                <div>{moves[i + 1].toString()}</div>
                            </div>
                        )}
                    </div>
                </li>
            );
        }

        return list;
    }

    render() {
        const { height } = this.props;

        return (
            <div
                className="mt-3"
                style={{
                    width: 250
                }}
            >
                <h5 className="mb-2">Moves:</h5>
                <ol
                    ref={this.listRef}
                    style={{
                        height: 200,
                        overflowY: "auto",
                        "--bs-bg-opacity": 0.05
                    }}
                    className="bg-secondary rounded py-2 border moz-scrollbar webkit-scrollbar"
                >
                    {this.createList()}
                </ol>
            </div>
        );
    }
}

export default MoveList;
