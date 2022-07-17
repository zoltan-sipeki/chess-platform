import React, { Component } from "react";

class ChessPiece extends Component {
  render() {
    const {
      onMouseDown,
      className,
      imgRef,
      img,
      style,
      row,
      col,
      moveHighlight,
      legalMoveHighlight
    } = this.props;
    return (
      <div
        style={{
          width: "inherit",
          height: "inherit",
          backgroundColor: moveHighlight
        }}
      >
        <div
          className="d-flex justify-content-center align-items-center"
          style={{
            width: "inherit",
            height: "inherit",
            backgroundColor: legalMoveHighlight
          }}
        >
          <img
            ref={imgRef}
            src={img}
            style={style}
            className={className}
            onMouseDown={onMouseDown}
            alt=""
            width="40"
            height="40"
            data-row={row}
            data-col={col}
            draggable={false}
          />
        </div>
      </div>
    );
  }
}

export default ChessPiece;
