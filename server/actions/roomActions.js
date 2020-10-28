const rooms = [];

const addRoom = ({ drawer, roomId }) => {
    const room = { drawer, roomId, queue: [], maxRoomSize: 20 };
    rooms.push(room);

    return room;
};

const removeRoom = (id) => {
    const index = rooms.findIndex((room) => room.id === id);
    if (index !== -1) return rooms.splice(index, 1)[0];
};

const getRoomByRoomId = (roomId) => rooms.filter((room) => room.roomId === roomId)[0];

module.exports = { addRoom, removeRoom, getRoomByRoomId };