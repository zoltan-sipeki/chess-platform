import React, { Component } from 'react';

class Stats extends Component {
    render() {
        const { stats } = this.props;

        let footer = null;
        let body = null;
        if (stats.length === 0) {
            footer = (<div className="text-center mb-4">No statistics available</div>);
        }
        else {
            body = stats.map((stat, index) => (
                <tr key={index}>
                    <td>{stat.matchType}</td>
                    <td>{stat.gamesPlayed}</td>
                    <td>{stat.wins}</td>
                    <td>{stat.draws}</td>
                    <td>{stat.losses}</td>
                    <td>{`${(stat.wins / stat.gamesPlayed * 100).toFixed(2)}%`}</td>
                </tr>
            ))
        }

        if (stats.length > 1) {
            const total = stats.reduce((prev, current) => {
                prev.gamesPlayed += current.gamesPlayed;
                prev.wins += current.wins;
                prev.draws += current.draws;
                prev.losses += current.losses;
                return prev;
            }, { gamesPlayed: 0, wins: 0, draws: 0, losses: 0, winRate: 0 });

            body.push((
                <tr key={body.length + 1}>
                    <th>all</th>
                    <th>{total.gamesPlayed}</th>
                    <th>{total.wins}</th>
                    <th>{total.draws}</th>
                    <th>{total.losses}</th>
                    <th>{`${(total.wins / total.gamesPlayed * 100).toFixed(2)}%`}</th>
                </tr>
            ));
        }

        return (
            <div className="w-100 me-3">
                <h4 className="border-bottom pb-2 border-secondary px-2 py-2">
                    Statistics
                </h4>
                <table className="table table-responsive-lg table-striped table-hover mb-2">
                    <thead>
                        <tr>
                            <th>Match type</th>
                            <th>Matches played</th>
                            <th>Wins</th>
                            <th>Draws</th>
                            <th>Losses</th>
                            <th>Win rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {body}
                    </tbody>
                </table>
                {footer}
            </div>
        );
    }
}

export default Stats;