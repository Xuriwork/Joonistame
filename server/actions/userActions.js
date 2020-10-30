const users = [];

const addUser = ({ id, username, roomID, userCharacter }) => {
    const user = { id, username, roomID, userCharacter };
    users.push(user);
    return { user };
};

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if (index !== -1) return users.splice(index, 1)[0];
};

const getUser = (id) => users.find((user) => user.id === id);
const getAllUsersInRoom = (roomID) => users.filter((user) => user.roomID === roomID);

const leaveAllRooms = (socket) => {
	const rooms = socket.adapter.sids[socket.id];
	Object.keys(rooms).forEach((room) => {
		if (room !== socket.id) socket.leave(room);
	});
};

const checkIfNameExistsInRoom = (roomID, username) => {
    const room = getAllUsersInRoom(roomID);
    const user = room.filter((user) => user.username === username)[0];
    return user;
};

module.exports = { addUser, removeUser, getUser, checkIfNameExistsInRoom, getAllUsersInRoom, leaveAllRooms };