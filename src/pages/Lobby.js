import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { ReactComponent as ClipboardIcon } from '../assets/icons/clipboard-line.svg';
import { notyfError, notyfSuccess } from '../utils/notyf';

const Lobby = ({ roomID }) => {
    const [users, setUsers] = useState([]);
    const [isAbleToStart, setIsAbleToStart] = useState(false);
    const { socket } = useSocket();
    const history = useHistory();

    useEffect(() => {
        socket.emit('JOINED_LOBBY', roomID);
        socket.on('GET_USERS', (users) => setUsers(users));
        socket.on('ABLE_TO_START', (payload) => setIsAbleToStart(payload));
        socket.on('START_GAME', () => history.push('/game-room'));
        return () => socket.removeAllListeners();
    }, [history, roomID, socket]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(roomID).then(() => notyfSuccess('Copied invite link 📋'), 
        () => notyfError('Failed to copy invite link 🙁'));
    };
    
    const handleStartGame = (e) => {
        e.preventDefault();
        socket.emit('START_GAME', roomID);
    };

    return (
        <div className='lobby-page'>
            <div className='heading'>
                <h1>Room ID: {roomID}</h1>
                <button onClick={copyToClipboard}><ClipboardIcon /></button>
            </div>
            <ul className='lobby-list'>
                {
                    users.map((user) => (
                        <li key={user.id}>
                            <img src={user.userCharacter} alt='User Character' />
                            <span>{user.username}</span>
                        </li>
                    ))
                }
            </ul>
            {
                isAbleToStart && <button onClick={handleStartGame}>Start game</button>
            }
        </div>
    );
};

export default Lobby;