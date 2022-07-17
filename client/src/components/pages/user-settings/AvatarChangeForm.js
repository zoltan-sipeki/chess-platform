import React, { Component } from 'react';
import withLoader from "../../hoc/withLoader";
import Spinner from "../../Spinner";
import { GENERIC_ERROR } from '../../../utils/form-strings';
import { ROUTE_REMOVE_AVATAR } from '../../../utils/routes';

export class AvatarChangeForm extends Component {
    constructor(props) {
        super(props);

        this.fileButton = React.createRef();
        this.controller = new AbortController();
    }

    componentWillUnmount() {
        this.controller.abort();
    }

    clickFileButton = e => {
        this.fileButton.current.click();
    }

    removeAvatar = async e => {
        e.preventDefault();

        try {
            this.props.setLoading(true);
            const response = await fetch(ROUTE_REMOVE_AVATAR, {
                method: "POST",
                signal: this.controller.signal
            });

            if (response.ok) {
                const avatar = await response.json();
                this.props.setUser({ avatar: avatar.avatar });
                this.props.showAlert("You have successfully removed your avatar.", "success");
            }
            else {
                this.props.showAlert(GENERIC_ERROR, "danger");
            }
        }
        catch (e) {
            if (e.name === "AbortError") {
                return;
            }
        }
        finally {
            this.props.setLoading(false);
        }
    }

    render() {
        const { loading, selectImage } = this.props;

        return (
            <form onSubmit={(e) => e.preventDefault()}>
                <input ref={this.fileButton} onChange={selectImage} type="file" accept="image/*" hidden />
                <div className="d-flex flex-column">
                    <button type="button" onClick={this.clickFileButton} className="btn btn-secondary mb-2">
                        Change
                    </button>
                    <button type="submit" onClick={this.removeAvatar} className="btn btn-danger">
                        {loading ? <Spinner /> : "Remove"}
                    </button>
                </div>
            </form>
        )
    }
}

export default withLoader(AvatarChangeForm);
