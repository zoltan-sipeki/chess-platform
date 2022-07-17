import React, { Component } from 'react';
import Modal from "../../modal/Modal";
import ProfileNameForm from './ProfileNameForm';
import AvatarChangeForm from './AvatarChangeForm';
import AvatarEditor from './AvatarEditor';
import EmailForm from './EmailForm';
import ProfilePageForm from './ProfilePageForm';
import PasswordForm from './PasswordForm';
import Alert from '../../Alert';
import withAlert from '../../hoc/withAlert';
import Avatar from '../../Avatar';
import DeleteForm from './DeleteForm';
import VPContainer from "../../VPContainer";

const MODAL_STATE = {
    NONE: 0,
    AVATAR_EDITOR: 1,
    PROFILE_NAME_FORM: 2,
    EMAIL_FORM: 3,
    PASSWORD_FORM: 4,
    DELETE_ACCOUNT: 5
};

class UserSettingsPage extends Component {
    constructor(props) {
        super(props);

        this.image = null;
        this.state = {
            modalState: MODAL_STATE.NONE,
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.modalState !== this.state.modalState) {
            if (this.state.modalState !== MODAL_STATE.NONE) {
                this.props.setFormModal();
            }
        }

        if (prevProps.formModalShown !== this.props.formModalShown) {
            if (!this.props.formModalShown) {
                setTimeout(() => this.setState({ modalState: MODAL_STATE.NONE }), 150);
            }
        }
    }

    componentWillUnmount() {
        this.removeImage();
    }

    showAvatarEditor = () => {
        this.setState({ modalState: MODAL_STATE.AVATAR_EDITOR });
    }

    showProfilNameForm = () => {
        this.setState({ modalState: MODAL_STATE.PROFILE_NAME_FORM });
    }

    showEmailForm = () => {
        this.setState({ modalState: MODAL_STATE.EMAIL_FORM });
    }

    showPasswordForm = () => {
        this.setState({ modalState: MODAL_STATE.PASSWORD_FORM });
    }

    showdDeleteAccountForm = () => {
        this.setState({ modalState: MODAL_STATE.DELETE_ACCOUNT });
    }

    selectImage = async e => {
        if (this.image !== null) {
            this.removeImage();
        }
        this.image = new Image();
        this.image.src = URL.createObjectURL(e.target.files[0]);
        await this.image.decode();
        this.showAvatarEditor();
    }

    removeImage() {
        if (this.image !== null) {
            URL.revokeObjectURL(this.image.src);
        }
    }

    render() {
        const { 
            user, 
            setUser, 
            alertVisible, 
            alertContent,
            alertType, 
            showAlert, 
            closeAlert,
            logout,
            formModalShown,
            closeFormModal, 
        } = this.props;

        const { modalState } = this.state;

        return (
            <VPContainer className="container mt-2">
                <div className="container mt-2 position-relative">
                    <h3 className="mb-4">
                        <i className="bi bi-gear-fill"></i> User settings
                    </h3>
                    <Alert
                        type={alertType}
                        show={alertVisible}
                        onClose={closeAlert}
                        className="position-fixed start-50 translate-middle-x"
                    >
                        {alertContent}
                    </Alert>
                    <h4 className="border-bottom border-secondary pb-2 mb-4">Avatar</h4>
                    <div className="d-flex align-items-center justify-content-evenly">
                        <Avatar src={user.avatar} />
                        <AvatarChangeForm avatar={user.avatar} setUser={setUser} selectImage={this.selectImage} showAlert={showAlert} />
                    </div>
                    <div className="d-lg-flex justify-content-evenly mb-4">
                        <div className="w-100 me-3 mb-4 mb-lg-0">
                            <h4 className="border-bottom border-secondary pb-2 mb-4">Username</h4>
                            <div className="d-flex justify-content-between align-items-center">
                                <p>
                                    {user.name}
                                    <span className="text-muted">#{user.tag}</span>
                                </p>
                                <button className="btn btn-secondary" onClick={this.showProfilNameForm}>Change</button>
                            </div>
                        </div>
                        <div className="w-100">
                            <h4 className="border-bottom border-secondary pb-2 mb-4">E-mail</h4>
                            <div className="d-flex align-items-center justify-content-between">
                                <p>{user.email}</p>
                                <button className="btn btn-secondary" onClick={this.showEmailForm}>Change</button>
                            </div>
                        </div>
                    </div>
                    <div className="d-lg-flex justify-content-evenly mb-4">
                        <div className="w-100 me-3 mb-lg-0 mb-4">
                            <h4 className="border-bottom border-secondary pb-2 mb-4">Who can see my profile?</h4>
                            <ProfilePageForm visibility={user.profilePage} setUser={setUser} showAlert={showAlert} />
                        </div>
                        <div className="w-100">
                            <h4 className="border-bottom border-secondary pb-2 mb-4">Password</h4>
                            <div className="d-flex justify-content-end">
                                <button className="btn  btn-secondary" onClick={this.showPasswordForm}>Change</button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="border-bottom border-secondary pb-2 mb-4">Delete account</h4>
                        <div className="d-flex justify-content-center">
                            <button className="btn btn-danger" onClick={this.showdDeleteAccountForm}>Delete account</button>
                        </div>
                    </div>
                </div>
                <Modal show={formModalShown} onClose={closeFormModal}>
                    {modalState === MODAL_STATE.PROFILE_NAME_FORM &&
                        <ProfileNameForm
                            name={user.name}
                            setUser={setUser}
                            closeModal={closeFormModal}
                            showAlert={showAlert}
                        />}
                    {modalState === MODAL_STATE.AVATAR_EDITOR &&
                        <AvatarEditor
                            image={this.image}
                            setUser={setUser}
                            closeModal={closeFormModal}
                            showAlert={showAlert}
                        />}
                    {modalState === MODAL_STATE.EMAIL_FORM &&
                        <EmailForm
                            email={user.email}
                            setUser={setUser}
                            closeModal={closeFormModal}
                            showAlert={showAlert}
                        />}
                    {modalState === MODAL_STATE.PASSWORD_FORM &&
                        <PasswordForm
                            closeModal={closeFormModal}
                            showAlert={showAlert}
                        />}
                    {modalState === MODAL_STATE.DELETE_ACCOUNT &&
                        <DeleteForm
                            closeModal={closeFormModal}
                            logout={logout}
                        />}
                </Modal>
            </VPContainer>  
        );
    }
}

export default withAlert(UserSettingsPage);