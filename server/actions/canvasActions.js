const canvases = [];

const addCanvas = ({ roomID }) => {

    const canvas = { data: [], roomID };
    canvases.push(canvas);

    return canvas;
};

const updateCanvas = (roomID, data) => {
    const canvas = getCanvasByRoomID(roomID);
    canvas.data.push(data);
    return data;
};

const getCanvasByRoomID = (roomID) => canvases.filter((canvas) => canvas.roomID === roomID)[0];

const clearCanvas = (roomID) => {
    const canvas = getCanvasByRoomID(roomID);
    canvas.data = [];
    return canvas;
};

const removeCanvas = (id) => {
    const index = canvases.findIndex((canvas) => canvas.id === id);
    if (index !== -1) return canvases.splice(index, 1)[0];
};

module.exports = { addCanvas, updateCanvas, getCanvasByRoomID, clearCanvas, removeCanvas };