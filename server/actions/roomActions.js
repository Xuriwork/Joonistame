const rooms = [];

const addRoom = ({ drawer, roomID }) => {
    const room = { drawer, roomID, maxRoomSize: 10, word: null, countdownTimer: null };
    rooms.push(room);

    return room;
};

const removeRoom = (id) => {
    const index = rooms.findIndex((room) => room.id === id);
    if (index !== -1) return rooms.splice(index, 1)[0];
};

const getRoomByRoomID = (roomID) => rooms.filter((room) => room.roomID === roomID)[0];

module.exports = { rooms, addRoom, removeRoom, getRoomByRoomID };