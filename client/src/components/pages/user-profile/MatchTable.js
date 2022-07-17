import React, { Component } from 'react';
import { Link } from "react-router-dom";
import UserLink from '../../user/UserLink';
import { toAgoString } from '../../../utils/time';
import WhiteSquare from "../chess/WhiteSquare";
import BlackSquare from "../chess/BlackSquare";
import { PIECE_COLOR } from "../../../common/chess/pieces/piece-constants.mjs";
import { LINK_MATCHES_PAGE, LINK_MATCH_REPLAY } from '../../../utils/routes';

export class MatchTable extends Component {
    static insertRow(match, index) {
        const { id, opponent, mmrChange, score, duration, color, createdAt } = match;
        let outcome = null
        if (score === 1) {
            outcome = { className: "text-success", text: "win" };
        }
        else if (score === 0) {
            outcome = { className: "text-danger", text: "loss" };
        }
        else if (score === 0.5) {
            outcome = { className: "text-warning", text: "draw" };
        }

        const durationText = duration.startsWith("00:") ? duration.substr(3) : duration;
        return (
            <tr key={id}>
                <th>{index + 1}</th>
                <td>{toAgoString(new Date(createdAt))}</td>
                <td>{match.type}</td>
                <td>{opponent ? <UserLink id={opponent.id} name={opponent.name} tag={opponent.tag} avatar={opponent.avatar} /> : "deleted user"}</td>
                <td>{durationText}</td>
                <td>{color === PIECE_COLOR.WHITE ? <WhiteSquare /> : <BlackSquare />}</td>
                <td className={outcome.className}>{outcome.text}</td>
                <td className={`${mmrChange > 0 ? "text-success" : "text-danger"}`}>
                    {mmrChange === null ? "" : (mmrChange > 0 ? "+" : "") + mmrChange}
                </td>
                <td><Link to={LINK_MATCH_REPLAY(id)}>watch</Link></td>
            </tr>
        );
    }

    render() {
        const { matches, showCurrentPage, userId } = this.props;

        let list = [];
        let footer = null;

        if (matches.length === 0) {
            footer = (<div className="text-center mb-4">No recent matches</div>);
        }
        else {
            if (showCurrentPage) {
                list = showCurrentPage(matches, MatchTable.insertRow);
            }
            else {
                list = matches.map(MatchTable.insertRow);
            }

            if (userId) {
                footer = (
                    <Link to={LINK_MATCHES_PAGE(userId)} className="btn btn-outline-secondary mb-3 d-block w-100">
                        Show more
                    </Link>
                );
            }
        }

        return (
            <>
                <table className="table table-responsive-lg table-striped table-hover mb-2">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Played</th>
                            <th>Type</th>
                            <th>Opponent</th>
                            <th>Duration</th>
                            <th>Color</th>
                            <th>Outcome</th>
                            <th>MMR change</th>
                            <th>Replay</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list}
                    </tbody>
                </table>
                {footer}
            </>
        );
    }
}

export default MatchTable;