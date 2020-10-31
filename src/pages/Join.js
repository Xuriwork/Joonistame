import { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import qs from 'query-string';

import { validateJoinRoomData } from '../utils/validators';
import { getRandomOptions } from '../components/CharacterEditor/getRandomOptions';
import { isEmpty } from 'lodash';
import { useSocket } from '../context/SocketContext';

const Join = ({ setIsAuthorized, handleSetCredentials, userCharacter, setUserCharacter }) => {
    const history = useHistory();
	const location = useLocation();
    const [username, setUsername] = useState('');
    const [roomID, setRoomID] = useState('');
	const [errors, setErrors] = useState({});
	const { socket } = useSocket();
	
	const props = useMemo(() => (location.search ? qs.parse(location.search) : getRandomOptions()),
		[location.search]
	);

	const parsedQueryStringCharacterURL = qs.stringify(
		Object.entries(props).reduce(
			(total, [key, value]) => ({ ...total, [key]: value }),
			{}
		)
	);

	const svgURL = useMemo(() => `/svg?${parsedQueryStringCharacterURL}`, [
		parsedQueryStringCharacterURL,
	]);

	useEffect(() => {
		if (userCharacter === '') {
			setUserCharacter(`https://bigheads.io${svgURL}`);
		};
	}, [setUserCharacter, svgURL, userCharacter]);

    const handleOnChangeRoomID = (e) => setRoomID(e.target.value);
	const handleOnChangeUsername = (e) => setUsername(e.target.value);

    const handleJoinRoom = async (e) => {
        e.preventDefault();
        const { valid, errors } = validateJoinRoomData(username, roomID);
        
		if (!valid) return setErrors(errors);
		
		socket.emit('JOIN_LOBBY', { roomID, socketID: socket.id, username, userCharacter }, (result, message) => {
			if (result) {
				handleSetCredentials(username, roomID);
				setIsAuthorized(true);
				history.push('/lobby');
			} else alert(message);
		});
	};

	const handleCreateRoom = async (e) => {
		e.preventDefault();

		if (isEmpty(username)) {
			return setErrors({ username: 'This field is required' });
		};

		socket.emit('CREATE_LOBBY', { userCharacter, username }, (roomID) => {
			handleSetCredentials(username, roomID);
			setIsAuthorized(true);
			history.push('/lobby');
		});
	};
	
	const handlePushToCharacterEditor = (e) => {
		e.preventDefault();
		history.push(`/character-editor?${parsedQueryStringCharacterURL}`);
	};

    return (
			<div className='join-page'>
				<form>
					<img src={userCharacter} alt='User Character' onClick={handlePushToCharacterEditor} />
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