import React, { Component } from 'react';
import MatchTable from './MatchTable';


export class Matches extends Component {
    render() {
        const { matches, userId } = this.props;

        return (
            <div>
                <h4 className="border-bottom pb-2 border-secondary px-2 py-2">
                    Recent matches
                </h4>
                <MatchTable matches={matches} userId={userId} />
            </div>
        );
    }
}

export default Matches;
