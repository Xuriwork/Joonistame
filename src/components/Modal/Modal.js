import ChooseWordModal from './ChooseWordModal';
import DrawerIsChoosingAWordModal from './DrawerIsChoosingAWordModal';

const Modal = ({ socketID, drawer, handleChooseWord, isTimerActive }) => {

    return (
        <div className='modal-overlay'>
            {socketID === drawer ? <ChooseWordModal handleChooseWord={handleChooseWord} /> : <DrawerIsChoosingAWordModal />}
        </div>
    );
};

export default Modal;