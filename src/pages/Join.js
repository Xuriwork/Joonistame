import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import shortid from 'shortid';
import { validateJoinRoomData } from '../utils/validators';

const Join = ({ setIsAuthorized, handleSetCredentials }) => {
    const history = useHistory();
    const [username, setUsername] = useState('');
    const [roomID, setRoomID] = useState('');
    const [errors, setErrors] = useState({});

    const handleOnChangeRoomID = (e) => setRoomID(e.target.value);
    const handleOnChangeUsername = (e) => setUsername(e.target.value);

    const handleGenerateRandomRoomID = (e) => setRoomID(createRandomRoomID(e));

	const createRandomRoomID = (e) => {
        e.preventDefault();
        const randomId = shortid.generate() + shortid.generate();
		return randomId;
    };
    
    const handleJoinRoom = (e) => {
        e.preventDefault();
        const { valid, errors } = validateJoinRoomData(username, roomID);
        
		if (!valid) return setErrors(errors);
        
        handleSetCredentials(username, roomID);
        setIsAuthorized(true);
        history.push('/');
    };

    return (
			<div className='join-page'>
				<form>
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
					<button onClick={handleGenerateRandomRoomID}>
						Generate Random Room ID
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