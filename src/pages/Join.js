import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import shortid from 'shortid';
import { validateJoinRoomData } from '../utils/validators';

const Join = ({ setIsAuthorized, handleSetCredentials }) => {
    const history = useHistory();
    const [username, setUsername] = useState('');
    const [roomName, setRoomName] = useState('');
    const [errors, setErrors] = useState({});

    const handleOnChangeRoomName = (e) => setRoomName(e.target.value);
    const handleOnChangeUsername = (e) => setUsername(e.target.value);

    const handleGenerateRandomRoomName = (e) => setRoomName(createRandomRoomName(e));

	const createRandomRoomName = (e) => {
        e.preventDefault();
        const randomId = shortid.generate() + shortid.generate();
		return randomId;
    };
    
    const handleJoinRoom = (e) => {
        e.preventDefault();
        const { valid, errors } = validateJoinRoomData(username, roomName);
        
		if (!valid) return setErrors(errors);
        
        handleSetCredentials(username, roomName);
        setIsAuthorized(true);
        history.push('/');
    };

    return (
			<div className='join-page'>
				<form>
					<label htmlFor='roomName'>Room Name</label>
					<input
						type='text'
						id='roomName'
						onChange={handleOnChangeRoomName}
						value={roomName}
						className={errors.roomName && 'has-error'}
					/>
					{errors.roomName && (
						<span className='error-message'>{errors.roomName}</span>
					)}
					<button onClick={handleGenerateRandomRoomName}>
						Generate Random Room Name
					</button>
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
					<button className='join-button' onClick={handleJoinRoom}>
						Join
					</button>
				</form>
			</div>
		);
};

export default Join;