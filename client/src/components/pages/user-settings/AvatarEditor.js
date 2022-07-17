import React, { Component } from "react";
import { GENERIC_ERROR } from "../../../utils/form-strings";
import FormButton from "../../form/FormButton";
import ModalBody from "../../modal/ModalBody";
import ModalHeader from "../../modal/ModalHeader";
import withLoader from "../../hoc/withLoader";
import { ROUTE_UPLOAD_AVATAR } from "../../../utils/routes";

const AVATAR_SIZE = 255;
const CANVAS_HEIGHT = AVATAR_SIZE;
const CANVAS_WIDTH = (CANVAS_HEIGHT * 16) / 9;
const SHRINK_FACTOR = 0.95;
const MAGNIFIY_FACTOR = 1.05;

class AvatarEditor extends Component {
    constructor(props) {
        super(props);
        this.canvas = React.createRef();
        this.cContext = null;
        this.offScreenCanvas = React.createRef();
        this.oContext = null;
        this.prevMouseX = 0;
        this.prevMouseY = 0;

        this.controller = new AbortController();

        this.prevRangeInputValue = 1;
        this.state = {
            rangeInputValue: this.prevRangeInputValue
        }
    }

    componentDidMount() {
        this.cContext = this.canvas.current.getContext("2d");
        this.oContext = this.offScreenCanvas.current.getContext("2d");
        this.loadImage();
        this.drawCanvas();
    }

    componentWillUnmount() {
        this.controller.abort();
    }

    scaleWithRangeInput = e => {
        const diff = e.target.value - this.prevRangeInputValue;

        const ox = CANVAS_WIDTH / 2;
        const oy = CANVAS_HEIGHT / 2;

        if (diff < 0) {
            this.shrinkImage(ox, oy, Math.abs(diff));
        }
        else {
            this.magnifyImage(ox, oy, diff);
        }

        this.drawCanvas();

        this.prevRangeInputValue = e.target.value;
        this.setState({ rangeInputValue: e.target.value });
    }

    startDragging = e => {
        this.prevMouseX = e.clientX;
        this.prevMouseY = e.clientY;
        document.addEventListener("mouseup", this.cancelDragging);
        document.addEventListener("mousemove", this.moveImage);
    }

    cancelDragging = e => {
        document.removeEventListener("mouseup", this.cancelDragging);
        document.removeEventListener("mousemove", this.moveImage);
    }

    moveImage = e => {
        const dx = e.clientX - this.prevMouseX;
        const dy = e.clientY - this.prevMouseY;

        this.translateInImageSpace(dx, dy);

        const img = this.imageBoundingBox();
        const border = this.borderBoundingBox();
        this.correctImgPosition(img, border);

        this.drawCanvas();
        this.prevMouseX = e.clientX;
        this.prevMouseY = e.clientY;
    }

    multiplyBYDOMMatrix(dommatrix, x, y) {
        const x1 = x * dommatrix.a + y * dommatrix.c;
        const y1 = x * dommatrix.b + y * dommatrix.d;
        return { x: x1, y: y1 };
    }

    translateInImageSpace(dx, dy) {
        const offset = this.multiplyBYDOMMatrix(
            this.cContext.getTransform().inverse(),
            dx,
            dy
        );
        this.cContext.translate(offset.x, offset.y);
    }

    scaleAroundPoint(factor, ox, oy) {
        const transform = this.cContext.getTransform();
        const dx = ox - transform.e;
        const dy = oy - transform.f;

        const offset = this.multiplyBYDOMMatrix(transform.inverse(), dx, dy);
        this.cContext.translate(offset.x, offset.y);
        this.cContext.scale(factor, factor);
        this.cContext.translate(-offset.x, -offset.y);
    }

    canvasPosition() {
        const boundingRect = this.canvas.current.getBoundingClientRect();
        return [boundingRect.left, boundingRect.top];
    }

    drawOverlay() {
        this.cContext.save();
        this.cContext.resetTransform();
        this.cContext.fillStyle = "rgba(50, 50, 50, 0.7)";
        this.cContext.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.cContext.globalCompositeOperation = "destination-out";
        this.cContext.beginPath();
        this.cContext.fillStyle = "#000000";
        this.cContext.arc(
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT / 2,
            AVATAR_SIZE / 2,
            0,
            Math.PI * 2
        );
        this.cContext.fill();
        this.cContext.globalCompositeOperation = "source-over";
        this.cContext.beginPath();
        this.cContext.strokeStyle = "#ffffff";
        this.cContext.lineWidth = 3;
        this.cContext.arc(
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT / 2,
            AVATAR_SIZE / 2,
            0,
            Math.PI * 2
        );
        this.cContext.stroke();
        this.cContext.restore();
    }

    drawImage() {
        this.cContext.save();
        this.cContext.globalCompositeOperation = "destination-over";
        this.cContext.drawImage(this.props.image, 0, 0);
        this.drawBackground();
        this.cContext.restore();
    }

    drawBackground() {
        this.cContext.save();
        this.cContext.resetTransform();
        this.cContext.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.cContext.restore();
    }

    drawCanvas() {
        this.clearCanvas();
        this.drawOverlay();
        this.drawImage();
    }

    clearCanvas() {
        this.cContext.save();
        this.cContext.resetTransform();
        this.cContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.cContext.restore();
    }

    loadImage() {
        this.cContext.resetTransform();
        let scaleFactor = CANVAS_HEIGHT / this.props.image.height;
        const scaledWidth = scaleFactor * this.props.image.width;
        if (scaledWidth < AVATAR_SIZE) {
            scaleFactor *= AVATAR_SIZE / scaledWidth;
        }

        const xMiddle = (this.props.image.width * scaleFactor) / 2;
        const yMiddle = (this.props.image.height * scaleFactor) / 2;
        this.cContext.translate(
            CANVAS_WIDTH / 2 - xMiddle,
            CANVAS_HEIGHT / 2 - yMiddle
        );
        this.cContext.scale(scaleFactor, scaleFactor);

        this.drawCanvas();
    }

    borderBoundingBox() {
        const top = 0;
        const left = Math.floor((CANVAS_WIDTH - AVATAR_SIZE) / 2);
        const right = left + AVATAR_SIZE;
        const bottom = AVATAR_SIZE;

        return { top, left, right, bottom };
    }

    imageBoundingBox() {
        const transform = this.cContext.getTransform();
        const dimension = this.multiplyBYDOMMatrix(
            transform,
            this.props.image.width,
            this.props.image.height
        );
        const top = transform.f;
        const left = transform.e;
        const right = left + dimension.x;
        const bottom = top + dimension.y;

        return { top, left, right, bottom };
    }

    correctImgPosition(img, border) {
        let correctionX = 0;
        let correctionY = 0;

        if (img.top >= border.top) {
            correctionY += border.top - img.top;
        }
        if (img.left >= border.left) {
            correctionX += border.left - img.left;
        }
        if (img.right <= border.right) {
            correctionX += border.right - img.right;
        }
        if (img.bottom <= border.bottom) {
            correctionY += border.bottom - img.bottom;
        }

        this.translateInImageSpace(correctionX, correctionY);
    }

    shrinkImage(ox, oy, times = 1) {
        const border = this.borderBoundingBox();
        const borderHeight = border.bottom - border.top;
        const borderWidth = border.right - border.left;

        let img = this.imageBoundingBox();
        let imgHeight = img.bottom - img.top;
        let imgWidth = img.right - img.left;

        if (
            Math.round(imgHeight) === borderHeight ||
            Math.round(imgWidth) === borderWidth
        ) {
            return;
        }

        this.scaleAroundPoint(SHRINK_FACTOR ** times, ox, oy);

        img = this.imageBoundingBox();
        imgHeight = img.bottom - img.top;
        imgWidth = img.right - img.left;

        let scaleFactor = 1;

        if (imgHeight < borderHeight) {
            scaleFactor *= borderHeight / imgHeight;
            if (scaleFactor * imgWidth < borderWidth) {
                scaleFactor *= borderWidth / imgWidth / scaleFactor;
            }
        } else if (imgWidth < borderWidth) {
            scaleFactor *= borderWidth / imgWidth;
            if (scaleFactor * imgHeight < borderHeight) {
                scaleFactor *= borderHeight / imgHeight / scaleFactor;
            }
        }

        this.cContext.scale(scaleFactor, scaleFactor);

        img = this.imageBoundingBox();

        this.correctImgPosition(img, border);
    }

    magnifyImage(ox, oy, times = 1) {
        this.scaleAroundPoint(MAGNIFIY_FACTOR ** times, ox, oy);

        const img = this.imageBoundingBox();
        const border = this.borderBoundingBox();
        this.correctImgPosition(img, border);
    }

    mouseWheelScale = e => {
        const [canvasX, canvasY] = this.canvasPosition();
        const ox = e.clientX - canvasX;
        const oy = e.clientY - canvasY;
        const { rangeInputValue } = this.state;

        let change = 0;

        if (e.deltaY > 0) {
            if (rangeInputValue > 1) {
                this.shrinkImage(ox, oy);
                --change;
            }
        } else {
            if (rangeInputValue < 100) {
                this.magnifyImage(ox, oy);
                ++change;
            }
        }

        if (change !== 0) {
            this.setState(state => {
                const newRangeInputValue = Number.parseInt(state.rangeInputValue) + change;
                this.prevRangeInputValue = newRangeInputValue;
                return {
                    rangeInputValue: newRangeInputValue
                }
            });
        }

        this.drawCanvas();
    }

    drawOnOffScreenCanvas(e) {
        const mx = CANVAS_WIDTH / 2 - AVATAR_SIZE / 2;
        const transform = this.cContext.getTransform();
        this.oContext.setTransform(transform);
        const offset = this.multiplyBYDOMMatrix(transform.inverse(), mx, 0);
        this.oContext.translate(-offset.x, -offset.y);
        this.oContext.drawImage(this.props.image, 0, 0);
    }

    uploadAvatar = async image => {
        try {
            this.props.setLoading(true);
            const response = await fetch(ROUTE_UPLOAD_AVATAR, {
                method: "POST",
                body: image,
                signal: this.controller.signal
            });

            if (response.ok) {
                const avatar = await response.json();
                this.props.setUser({ avatar: avatar.avatar })
                this.props.showAlert("You have successfully changed your avatar.", "success");
            }
            else if (response.status === 413) {
                this.props.showAlert("Your avatar is too large. Size must be below 5 MB.", "warning")
            }
            else {
                this.props.showAlert(GENERIC_ERROR, "danger");
            }
        }
        catch (e) {
            console.log(e);
            if (e.name === "AbortError") {
                return;
            }
        }
        finally {
            this.props.setLoading(false);
            this.props.closeModal();
        }
    }

    upload = e => {
        e.preventDefault();
        this.drawOnOffScreenCanvas();
        this.offScreenCanvas.current.toBlob(this.uploadAvatar, "image/png");
    }

    render() {
        const { loading } = this.props;

        return (
            <>
                <ModalHeader closeButton>
                    Edit your avatar
                </ModalHeader>
                <ModalBody>
                    <form className="mx-auto" style={containerStyle}>
                        <canvas
                            className="border shadow-sm"
                            id="main-canvas"
                            onMouseDown={this.startDragging}
                            onWheel={this.mouseWheelScale}
                            ref={this.canvas}
                            width={CANVAS_WIDTH}
                            height={CANVAS_HEIGHT}
                        ></canvas>
                        <canvas
                            ref={this.offScreenCanvas}
                            id="avatar"
                            width={AVATAR_SIZE}
                            height={AVATAR_SIZE}
                            hidden
                        ></canvas>
                        <input onChange={this.scaleWithRangeInput} type="range" className="form-range" min="1" max="100" value={this.state.rangeInputValue} step="1" />
                        <FormButton centered loading={loading} onSubmit={this.upload} title="Upload" />
                    </form>
                </ModalBody>
            </>
        );
    }
}

const containerStyle = {
    width: CANVAS_WIDTH
};

export default withLoader(AvatarEditor);
