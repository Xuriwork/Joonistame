const { sendMutation, sendQuery } = require('./dgraphActions');

const addRoom = async ({ roomID, drawer, word }) => sendMutation({
	operationName: 'addRoom',
    mutation: `
        mutation {
            addRoom(input: [{ roomID: "${roomID}", drawer: "${drawer}", maxRoomSize: 10, word: "${word}" }]) {
                room {
                    roomID,
                    drawer
                }
            }
        }
    `,
    variables: 'roomID drawer maxRoomSize word',
});

const deleteRoom = async (roomID) => sendMutation({ 
    operationName: 'deleteRoom', 
    mutation: `
        mutation {
            deleteRoom(filter: {roomID: {allofterms: "${roomID}"}}) {
                room {
                    roomID
                }
            }
        }
    `,
    variables: 'roomID'
});

const getRoom = async (roomID) => sendQuery({ 
    operationName: 'queryRoom', 
    query: `
        query {
            queryRoom(filter: {roomID: {allofterms: "${roomID}"}}) {
                roomID,
                drawer,
            }
        }
    `, 
    variables: 'roomID drawer, maxRoomSize, word' 
})[0];

// const addRoom = ({ drawer, roomID }) => {
// 	const room = {
// 		drawer,
// 		roomID,
// 		maxRoomSize: 10,
// 		word: null,
// 		countdownTimer: null,
// 	};
// 	rooms.push(room);

// 	return room;
// };


module.exports = { addRoom, deleteRoom, getRoom };
