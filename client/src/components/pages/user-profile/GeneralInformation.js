import React, { Component } from 'react';
import { toAgoString } from '../../../utils/time';

class GeneralInformation extends Component {
    static toSequenceNumber(number) {
        const lastDigit = number % 10;

        let suffix = null;

        switch (lastDigit) {
            case 1:
                suffix = <sup>st</sup>;
                break;

            case 2:
                suffix = <sup>nd</sup>;
                break;

            case 3:
                suffix = <sup>rd</sup>;
                break;

            default:
                suffix = <sup>th</sup>;
                break;
        }

        return <>{number}{suffix}</>;
    }

    render() {
        const { info } = this.props;

        return (
            <div className="w-100 me-3">
                <h4 className="border-bottom pb-2 border-secondary px-2 py-2">
                    General information
                </h4>
                <table className="table table-responsive table-hover">
                    <tbody>
                        <tr>
                            <td>MMR</td>
                            <td>{info.rankedMMR.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td>Ranking</td>
                            <td>{GeneralInformation.toSequenceNumber(info.ranking)}</td>
                        </tr>
                        <tr>
                            <td>Percentile</td>
                            <td>{GeneralInformation.toSequenceNumber(info.percentile)}</td>
                        </tr>
                        <tr>
                            <td>Joined</td>
                            <td>{new Date(info.createdAt).toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td>Last online</td>
                            <td>{info.lastOnline === null ? "N/A" : toAgoString(new Date(info.lastOnline))}</td>
                        </tr>
                        <tr>
                            <td>Last played</td>
                            <td>{info.lastPlayed === null ? "N/A" : toAgoString(new Date(info.lastPlayed))}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}

export default GeneralInformation;
