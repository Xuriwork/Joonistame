const canvases = [];

const addCanvas = ({ data, roomId }) => {

    const canvas = { data, roomId };
    canvases.push(canvas);

    return canvas;
};

const updateCanvas = (roomId, data) => {
    const canvas = getCanvasByRoomId(roomId);
    canvas.data.push(data);
    return canvas;
};

const getCanvasByRoomId = (roomId) => canvases.filter((room) => room.roomId === roomId)[0];

const clearCanvas = (roomId) => {
    let canvas = getCanvasByRoomId(roomId);
    canvas = [];
    return canvas;
};

const removeCanvas = (id) => {
    const index = canvases.findIndex((canvas) => canvas.id === id);
    if (index !== -1) return canvases.splice(index, 1)[0];
};

module.exports = { addCanvas, updateCanvas, getCanvasByRoomId, clearCanvas, removeCanvas };