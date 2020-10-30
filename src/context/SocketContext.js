import { useEffect, createContext, useState, useContext } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

const socketURL = 'http://localhost:5000';
const _socket = io(socketURL);

export const SocketProvider = ({ children }) => {

    const [socket, setSocket] = useState(null);
    useEffect(() => setSocket(_socket), []);

    console.log(socket);
    
    return (
        <SocketContext.Provider 
        value={socket}>
            {children}
        </SocketContext.Provider>
    )
};

const useSocket = () => useContext(SocketContext);

export { useSocket, SocketContext };

export default SocketContext;