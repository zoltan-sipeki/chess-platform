import React, { Component } from "react";
import withPagination from "../../pagination/withPagination";
import MatchTable from "./MatchTable";
import { withRouter } from "react-router-dom";
import { PIECE_COLOR } from "../../../common/chess/pieces/piece-constants.mjs";
import UserLink from "../../user/UserLink";
import { ROUTE_USER_MATCHES } from "../../../utils/routes";

const TYPE = Object.freeze({
    RANKED: "ranked",
    UNRANKED: "unranked",
    PRIVATE: "private",
    ALL: "all"
});

const OUTCOME = Object.freeze({
    WIN: "win",
    LOSS: "loss",
    DRAW: "draw",
    ALL: "all"
});

const COLOR = Object.freeze({
    BLACK: "black",
    WHITE: "white",
    ALL: "all"
})

const SORT = Object.freeze({
    NEWEST_TO_OLDEST: "newest to oldest",
    OLDEST_TO_NEWEST: "oldest to newest"
});

class UserMatches extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: {},
            displayedMatches: []
        };

        this.matches = [];
        this.sortBy = {
            [SORT.NEWEST_TO_OLDEST]: (a, b) => {
                const ams = new Date(a.createdAt).getTime();
                const bms = new Date(b.createdAt).getTime();
                if (ams > bms) {
                    return -1;
                }
                if (ams < bms) {
                    return 1;
                }

                return 0;
            },
            [SORT.OLDEST_TO_NEWEST]: (a, b) => {
                return -1 * this.sortBy[SORT.NEWEST_TO_OLDEST](a, b);
            }
        };

        this.filterType = {
            [TYPE.ALL]: (match) => true,
            [TYPE.RANKED]: (match) => match.type === TYPE.RANKED,
            [TYPE.UNRANKED]: (match) => match.type === TYPE.UNRANKED,
            [TYPE.PRIVATE]: (match) => match.type === TYPE.PRIVATE,
        }

        this.filterOutcome = {
            [OUTCOME.ALL]: (match) => true,
            [OUTCOME.WIN]: (match) => match.score === 1,
            [OUTCOME.LOSS]: (match) => match.score === 0,
            [OUTCOME.DRAW]: (match) => match.score === 0.5,
        }

        this.filterColor = {
            [COLOR.ALL]: (match) => true,
            [COLOR.BLACK]: (match) => match.color === PIECE_COLOR.BLACK,
            [COLOR.WHITE]: (match) => match.color === PIECE_COLOR.WHITE
        };

        this.selectionType = React.createRef();
        this.selectionOutcome = React.createRef();
        this.selectionSort = React.createRef();
        this.selectionColor = React.createRef();
    }

    componentDidMount() {
        this.fetchMatchHistory();
    }

    componentDidUpdate(prevProps) {
        if (this.props.match.params.id !== prevProps.match.params.id) {
            this.fetchMatchHistory();
        }
    }

    async fetchMatchHistory() {
        let response = await fetch(ROUTE_USER_MATCHES(this.props.match.params.id));
        if (response.ok) {
            response = await response.json();
            this.props.setNumberOfItems(response.matches.length);
            this.matches = response.matches;
            this.setState({ displayedMatches: this.matches, user: response.user });
        }
    }

    handleSelection = (e) => {
        const filterType = this.selectionType.current.value;
        const filterColor = this.selectionColor.current.value;
        const filterOutcome = this.selectionOutcome.current.value;
        const sortBy = this.selectionSort.current.value;

        console.log(filterColor);

        const displayedMatches = this.matches.filter(match => (
            this.filterColor[filterColor](match) &&
            this.filterType[filterType](match) &&
            this.filterOutcome[filterOutcome](match)))
            .sort(this.sortBy[sortBy]);
        this.props.setNumberOfItems(displayedMatches.length);
        this.setState({ displayedMatches });
    };

    render() {
        const { displayedMatches, user } = this.state;
        const { showCurrentPage } = this.props;

        return (
                <>
                <h4 className="d-flex align-items-center">
                    <UserLink id={user.id} name={user.name} avatar={user.avatar} tag={user.tag} avatarSize={40} />'s match history
                </h4>
                <div className="d-flex justify-content-center">

                    <form className="mb-4 d-flex align-items-center">
                        <div className="me-3">
                            <h5>Filter by:</h5>
                            <div className="d-flex align-items-center">
                                <div>
                                    <label className="me-2">Type: </label>
                                    <select ref={this.selectionType} className="me-4" onChange={this.handleSelection}>
                                        <option value={TYPE.ALL}>{TYPE.ALL}</option>
                                        <option value={TYPE.RANKED}>{TYPE.RANKED}</option>
                                        <option value={TYPE.UNRANKED}>{TYPE.UNRANKED}</option>
                                        <option value={TYPE.PRIVATE}>{TYPE.PRIVATE}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="me-2">Outcome: </label>
                                    <select ref={this.selectionOutcome} className="me-4" onChange={this.handleSelection}>
                                        <option value={OUTCOME.ALL}>{OUTCOME.ALL}</option>
                                        <option value={OUTCOME.WIN}>{OUTCOME.WIN}</option>
                                        <option value={OUTCOME.LOSS}>{OUTCOME.LOSS}</option>
                                        <option value={OUTCOME.DRAW}>{OUTCOME.DRAW}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="me-2">Color: </label>
                                    <select ref={this.selectionColor} className="me-4" onChange={this.handleSelection}>
                                        <option value={COLOR.ALL}>{COLOR.ALL}</option>
                                        <option value={COLOR.BLACK}>{COLOR.BLACK}</option>
                                        <option value={COLOR.WHITE}>{COLOR.WHITE}</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h5>Sort by:</h5>
                            <label className="me-2">Date played:</label>
                            <select ref={this.selectionSort} onChange={this.handleSelection}>
                                <option value={SORT.NEWEST_TO_OLDEST}>
                                    {SORT.NEWEST_TO_OLDEST}
                                </option>
                                <option value={SORT.OLDEST_TO_NEWEST}>
                                    {SORT.OLDEST_TO_NEWEST}
                                </option>
                            </select>
                        </div>
                    </form>
                </div>
                <MatchTable
                    matches={displayedMatches}
                    showCurrentPage={showCurrentPage}
                />
            </>
        );
    }
}

export default withPagination(withRouter(UserMatches));
