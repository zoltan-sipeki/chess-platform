import React, { Component } from 'react';

class FormInput extends Component {
    render() {
        const { label, type, value, error, help, onChange, loading, required } = this.props;

        return (
            <div className="mb-3">
                <label className="form-label">
                    {label}{required ? <span className="text-danger"> *</span> : null}
                </label>
                <input  className={`form-control${error == null ? "" : error ? " is-invalid" : " is-valid"}`}
                        type={type} value={value}
                        placeholder={label}
                        onChange={onChange}
                        disabled={loading ? true : false} 
                />
                {help ? <div className="form-text text-muted">{help}</div> : null}
                {error != null ? <div className="form-text text-danger fw-bold">{error}</div> : null}
            </div>
        );
    }
}

export default FormInput;
