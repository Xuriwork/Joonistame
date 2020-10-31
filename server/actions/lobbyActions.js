const lobbies = [];

const addLobby = ({ drawer, roomID }) => {
    const lobby = { drawer, roomID, maxLobbySize: 10, users: [] };
    lobbies.push(lobby);
    console.log('lobbies', lobbies);
    return lobby;
};

const addUserToLobby = (user) => {
    const lobby = getLobbyByLobbyID(user.roomID);
    lobby.users.push(user);
    console.log('lobby.users', user);
    console.log('addUserToLobby', user);
};

const removeLobby = (id) => {
    const index = lobbies.findIndex((lobby) => lobby.id === id);
    if (index !== -1) return lobbies.splice(index, 1)[0];
};

const getLobbyByLobbyID = (roomID) => lobbies.filter((lobby) => lobby.roomID === roomID)[0];

module.exports = { lobbies, addLobby, removeLobby, getLobbyByLobbyID, addUserToLobby };