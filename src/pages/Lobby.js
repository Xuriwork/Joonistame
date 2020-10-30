import { useQuery } from '@apollo/client';
import { GET_USERS } from '../utils/Apollo/Query';
import { ReactComponent as ClipboardIcon } from '../assets/icons/clipboard-line.svg';

const Lobby = ({ roomID }) => {
    console.log('Mounted');
    
    const { loading, error, data } = useQuery(GET_USERS, { variables: { roomID } });
    //const { loading, error, data } = useQuery(GET_USERS);

    if (loading) return <div>Loading</div>;
    if (error) return console.log(error);

    console.log(data);

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
                    data.queryUser.map((user) => (
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
