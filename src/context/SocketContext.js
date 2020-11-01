import { useEffect, createContext, useState, useContext } from 'react';
import io from 'socket.io-client';

const socketURL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://joonistame-server.herokuapp.com';

const SocketContext = createContext();
const _socket = io(socketURL);

export const SocketProvider = ({ children }) => {

    const [socket, setSocket] = useState(null);
    useEffect(() => setSocket(_socket), []);

    return (
        <SocketContext.Provider 
        value={{ socket }}>
            {children}
        </SocketContext.Provider>
    )
};

const useSocket = () => useContext(SocketContext);

export { useSocket, SocketContext };

export default SocketContext;