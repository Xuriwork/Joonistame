import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import qs from 'query-string';

import { validateJoinRoomData } from '../utils/validators';
import { getRandomOptions } from '../components/CharacterEditor/getRandomOptions';
import { isEmpty } from 'lodash';
import { useSocket } from '../context/SocketContext';

const Join = ({ setIsAuthorized, handleSetCredentials, userCharacter, setUserCharacter }) => {
    const history = useHistory();
    const [username, setUsername] = useState('');
    const [roomID, setRoomID] = useState('');
	const [errors, setErrors] = useState({});
	const { socket } = useSocket();
	
	useEffect(() => {
		const handleGenerateRandomCharacter = () => {
			const url = `/character-editor?${qs.stringify(getRandomOptions())}`;
			return `https://bigheads.io/svg?${url}`
		};
		setUserCharacter(handleGenerateRandomCharacter());
	}, [setUserCharacter]);

    const handleOnChangeRoomID = (e) => setRoomID(e.target.value);
    const handleOnChangeUsername = (e) => setUsername(e.target.value);
    
    // const handleJoinRoom = (e) => {
    //     e.preventDefault();
    //     const { valid, errors } = validateJoinRoomData(username, roomID);
        
	// 	if (!valid) return setErrors(errors);
        
    //     handleSetCredentials(username, roomID);
    //     setIsAuthorized(true);
    //     history.push('/room');
	// };
	
	const handleJoinRoom = async (e) => {
        e.preventDefault();
        const { valid, errors } = validateJoinRoomData(username, roomID);
        
		if (!valid) return setErrors(errors);

		await handleSetCredentials(username, roomID);
		await setIsAuthorized(true);

		await axios.post(`http://localhost:5000/join-room/${roomID}`, {
			roomID,
			socketID: socket.id,
			username,
			userCharacter
		})
		.catch((error) => {
			console.log(error);
		});

        history.push('/lobby');
    };

	const handleCreateRoom = async (e) => {
		e.preventDefault();

		if (isEmpty(username)) {
			return setErrors({ username: 'This field is required' });
		};
		
		await axios.post('http://localhost:5000/create-room', {
			socketID: socket.id,
			username,
			userCharacter
		})
		.then((response) => {
			handleSetCredentials(username, response.data.roomID);
			setIsAuthorized(true);
		})
		.catch((error) => {
			console.log(error);
		});

		history.push('/lobby');
	};

    return (
			<div className='join-page'>
				<form>
					<img src={userCharacter} alt='User Character' />
					<label htmlFor='username'>Username</label>
					<input
						type='text'
						id='username'
						onChange={handleOnChangeUsername}
						value={username}
						className={errors.username && 'has-error'}
					/>
					{errors.username && (
						<span className='error-message'>{errors.username}</span>
					)}
					<label htmlFor='roomID'>Room ID</label>
					<input
						type='text'
						id='roomID'
						onChange={handleOnChangeRoomID}
						value={roomID}
						className={errors.roomID && 'has-error'}
					/>
					{errors.roomID && (
						<span className='error-message'>{errors.roomID}</span>
					)}
					<button className='join-button' onClick={handleJoinRoom}>
						Join
					</button>
					<span className='strike'>
						Or
					</span>
					<button onClick={handleCreateRoom}>Create Room</button>
				</form>
			</div>
		);
};

export default Join;