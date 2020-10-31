const users = [];

const addUser = ({ id, username, roomID, userCharacter }) => {
    const user = { id, username, roomID, userCharacter, points: 0, isCorrectGuess: false };
    users.push(user);
    return { user };
};

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if (index !== -1) return users.splice(index, 1)[0];
};

const getUser = (id) => users.find((user) => user.id === id);
const getAllUsersInRoom = (roomID) => users.filter((user) => user.roomID === roomID);
const getAllUsersInRoomWhoGuessedCorrectly = (roomID) => {
    const usersInRoom = users.filter((user) => user.roomID === roomID);
    return usersInRoom.filter((user) => user.isCorrectGuess === true);
};

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

const emitUserIsCorrect = ({ user, drawerUserID, io }) => {
    const usersInRoom = getAllUsersInRoom(user.roomID);
    const drawer = getUser(drawerUserID);

    user.points =+ 5;
    user.isCorrectGuess = true;
    drawer.points =+ 1;

    io.in(user.roomID).emit('GET_USERS', usersInRoom);
    io.in(user.roomID).emit('MESSAGE', {
      type: 'SERVER-GUESSED_CORRECT_WORD',
      content: `${user.username} guessed the word! 👏`,
    });
};

module.exports = { addUser, removeUser, getUser, checkIfNameExistsInRoom, getAllUsersInRoom, getAllUsersInRoomWhoGuessedCorrectly, leaveAllRooms, emitUserIsCorrect };