import axios from 'axios';
import { useEffect, useState } from 'react';

const Lobby = ({ roomID, username }) => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        axios.get(`http://localhost:5000/get-lobby/${roomID}`)
        .then((response) => {
            console.log(response.data.users);
            
		})
		.catch((error) => {
			console.log(error);
		});
    }, [roomID]);

    return (
        <div>
            
        </div>
    );
};

export default Lobby;
