import React, { Component } from 'react';

class FormButton extends Component {
    render() {
        const { title, onSubmit, loading, centered, color } = this.props;

        return (
            <div className={`${centered ? "d-flex justify-content-center" : "d-grid"} mb3`}>
                <button type="submit" className={`btn btn-${color ?? "primary"}`} onClick={onSubmit} disabled={loading ? true : false}>
                    {loading ?
                        <div className="spinner-border">
                        </div> : title}
                </button>
            </div>
        );
    }
}

export default FormButton;
