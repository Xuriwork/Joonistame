import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import axios from 'axios';
import qs from 'query-string';

import { ADD_USER, ADD_ROOM } from '../utils/Apollo/Query';
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
	
	const [addUser, { error: userMutationError }] = useMutation(ADD_USER);
	const [addRoom, { error: roomMutationError }] = useMutation(ADD_ROOM);

	if (userMutationError) {
		console.log(userMutationError);
	} else if (roomMutationError) {
		console.log(roomMutationError);
	};
    
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

		addUser({ variables: { id: socket.id, username, roomID, userCharacter } })
		.then(() => {
			handleSetCredentials(username, roomID);
			setIsAuthorized(true);
			history.push('/lobby');
		});

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
			addRoom({ variables: { id: socket.id, username, roomID: response.data.roomID, userCharacter } });
			handleSetCredentials(username, roomID);
			setIsAuthorized(true);
			history.push('/lobby');
		});
		
	};

	// const handleCreateRoom = async (e) => {
	// 	e.preventDefault();

	// 	if (isEmpty(username)) {
	// 		return setErrors({ username: 'This field is required' });
	// 	};
		
	// 	await axios.post('http://localhost:5000/create-room', {
	// 		socketID: socket.id,
	// 		username,
	// 		userCharacter
	// 	})
	// 	.then((response) => {
	// 		handleSetCredentials(username, response.data.roomID);
	// 		setIsAuthorized(true);
	// 	})
	// 	.catch((error) => {
	// 		console.log(error);
	// 	});

	// 	history.push('/lobby');
	// };

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