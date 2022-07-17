import React, { Component } from 'react';
import { v4 as UUID } from "uuid";
import { STATUS_COLOR } from "../../utils/status-colors";

class User extends Component {
    static statusTextSize = {
        fontSize: "10px"
    };

    constructor(props) {
        super(props);
    
        this.noIndicatorID = UUID();
        this.indicatorID = UUID();
    }

    render() {
        const { avatar, name, tag, status, statusicon, statustext, tagonhover, className, avatarSize, nameSize } = this.props;

        return (
            <div className={`d-flex align-items-center ${className} ${tagonhover ? "user" : ""}`}>
                <div className="image">
                    <svg viewBox={`0 0 ${avatarSize ?? "30"} ${avatarSize ?? "30"}`} width={avatarSize ?? "30"} height={avatarSize ?? "30"} className="me-2">
                        <image width="100%" height="100%" href={avatar}  mask={`url(#${statusicon ? this.indicatorID : this.noIndicatorID})`} />
                        { statusicon ? 
                        <mask id={this.indicatorID}>
                            <circle cx="50%" cy="50%" r={avatarSize ? avatarSize / 2 : 15} fill="white" />
                            <circle cx="85%" cy="85%" r={avatarSize ? avatarSize / 4 : 7} fill="black" />
                        </mask> :
                        <mask id={this.noIndicatorID}>
                            <circle cx="50%" cy="50%" r={`${avatarSize ? avatarSize / 2 : "15"}`} fill="white" />
                        </mask> }
                        { statusicon && <circle cx="85%" cy="85%" r={avatarSize ? avatarSize / 7 : 4} fill={STATUS_COLOR[status]} /> }
                    </svg>
                </div>
                <div className="name" style={{ fontSize: `${nameSize}px`}}>
                    <p className="mb-0 lh-sm">{name}<span className={`text-muted ${tagonhover ? "tag" : ""}`}>#{tag}</span></p>
                    { statustext && <p className="mb-0 lh-sm" style={User.statusTextSize}>{statustext}</p> }
                </div>
            </div>
        );
    }
}

export default User;


