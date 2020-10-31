const lobbies = [];

const addLobby = ({ drawer, roomID }) => {
    const lobby = { drawer, roomID, maxLobbySize: 10, users: [] };
    lobbies.push(lobby);
    return lobby;
};

const addUserToLobby = (user) => {
    const lobby = getLobbyByLobbyID(user.roomID);
    lobby.users.push(user);
};

const removeLobby = (id) => {
    const index = lobbies.findIndex((lobby) => lobby.id === id);
    if (index !== -1) return lobbies.splice(index, 1)[0];
};

const getLobbyByLobbyID = (roomID) => lobbies.filter((lobby) => lobby.roomID === roomID)[0];

const checkIfNameExistsInLobby = (users, username) => {
    const user = users.filter((user) => user.username === username)[0];
    if (user) return true;
    else return false;
};

module.exports = { lobbies, addLobby, removeLobby, getLobbyByLobbyID, addUserToLobby, checkIfNameExistsInLobby };