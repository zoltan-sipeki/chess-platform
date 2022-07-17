import React, { Component } from "react"
import { ROUTE_LEADERBOARD } from "../../utils/routes";
import withPagination from "../pagination/withPagination";
import UserLink from "../user/UserLink";

class LeaderboardPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            leaderboard: []
        };

        this.abort = new AbortController();
    }

    async fetchLeaderboard() {
        try {
            const response = await fetch(ROUTE_LEADERBOARD, {
                signal: this.abort.signal
            });
            const leaderboard = await response.json();
            this.setState({ leaderboard });
            this.props.setNumberOfItems(leaderboard.length);
        }
        catch (err) {
            if (err.name === "AbortError") {
                return;
            }
        }
    }

    componentDidMount() {
        this.fetchLeaderboard();
    }

    componentWillUnmount() {
        this.abort.abort();
    }

    render() {
        const { leaderboard } = this.state;

        return (
            <>
                <h3 className="mb-4"><i className="bi bi-bar-chart-fill"></i> Leaderboard</h3>
                <table className="table table-hover">
                    <thead className="table-light">
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>MMR</th>
                            <th>Percentile</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.showCurrentPage(leaderboard, (user, index) => (
                            <tr key={index}>
                                <th>{index + 1}</th>
                                <td>
                                    <UserLink id={user.id} name={user.name} tag={user.tag} avatar={user.avatar} />
                                </td>
                                <td>
                                    {user.rankedMMR.toLocaleString()}
                                </td>
                                <td className="text-end pe-5">
                                    {user.percentile}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </>
        );
    }
}

export default withPagination(LeaderboardPage);