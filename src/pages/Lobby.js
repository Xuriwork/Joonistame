import { useEffect, useState } from 'react';
import { ReactComponent as ClipboardIcon } from '../assets/icons/clipboard-line.svg';import { useSocket } from '../context/SocketContext';
;

const Lobby = ({ roomID }) => {
    const [users, setUsers] = useState([]);
    const { socket } = useSocket();

    console.log('Mounted');

    useEffect(() => {
        console.log(roomID);
        socket.emit('JOINED_LOBBY', roomID);
        socket.on('GET_USERS', (users) => {
            console.log(users);
            setUsers(users);
        });
    }, [roomID, socket]);


    const copyToClipboard = () => {
		navigator.clipboard.writeText(roomID).then(() => {
			console.log('Copied invite link 📋');
		}, () => console.log('Failed to copy invite link 🙁'));
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
        </div>
    );
};

export default Lobby;
