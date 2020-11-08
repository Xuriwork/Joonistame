const { sendMutation, sendQuery } = require('./dgraphActions');

const addUser = async ({ id, username, roomID, userCharacter }) =>
	sendMutation({
		operationName: 'addUser',
		mutation: `
            mutation {
                addUser(input: [{ id: "${id}", username: "${username}", roomID: "${roomID}", lobbyID: "${roomID}",, userCharacter: "${userCharacter}", points: 0, isCorrectGuess: false }]) {
                    user {
                        id 
                        username 
                        roomID 
                        userCharacter 
                        points 
                        isCorrectGuess
                    }
                }
            }
        `,
		variables: 'id username roomID userCharacter points isCorrectGuess',
	});

const deleteUser = async (id) =>
	sendMutation({
		operationName: 'deleteUser',
		mutation: `
            mutation {
                deleteUser(filter: {id: {allofterms: "${id}"}}) {
                    user {
                        username
                        id
                    }
                }
            }
        `,
		variables: 'id username roomID',
	});

const updateUserWasCorrect = async ({ id, points }) => sendMutation({
    operationName: 'updateUser',
    mutation: `
        mutation {
            updateUser(input: {filter: {id: {allofterms: "${id}"}}, set: {isCorrectGuess: true, points: ${points}}}) {
                user {
                    username
                    points
                    id
                }
            }
        }
    `,
    variables: 'id username roomID userCharacter points isCorrectGuess',
});

const updateDrawer = async ({ id, points }) => sendMutation({
    operationName: 'updateUser',
    mutation: `
        mutation {
            updateUser(input: {filter: {id: {allofterms: "${id}"}}, set: {points: ${points}}}) {
                user {
                    username
                    points
                    id
                }
            }
        }
    `,
    variables: 'id username roomID userCharacter points isCorrectGuess',
});

const getUser = async (id) => sendQuery({ 
    operationName: 'queryUser', 
    query: `
        query {
            queryUser(filter: {id: {allofterms: "${id}"}}) {
                id
                username
                roomID
                userCharacter
                points
                isCorrectGuess
            }
        }
    `, 
    variables: 'id username roomID userCharacter points isCorrectGuess' 
  });
  
const getAllUsersInRoom = async (roomID) => sendQuery({ 
    operationName: 'queryUser', 
    query: `
        query {
            queryUser(filter: {roomID: {allofterms: "${roomID}"}}) {
                roomID
                username
                userCharacter
                points
                isCorrectGuess
                id
            }
        }
    `, 
    variables: 'id username roomID userCharacter points isCorrectGuess' 
  });

  const getAllUsersInLobby = async (lobbyID) => sendQuery({ 
    operationName: 'queryUser', 
    query: `
        query {
            queryUser(filter: {lobbyID: {allofterms: "${lobbyID}"}}) {
                lobbyID
                username
                userCharacter
                points
                isCorrectGuess
                id
            }
        }
    `, 
    variables: 'id username lobbyID userCharacter points isCorrectGuess' 
  });

  const getAllUsersInRoomWhoGuessedCorrectly = async (roomID) => sendQuery({ 
    operationName: 'queryUser', 
    query: `
        query {
            queryUser(filter: {isCorrectGuess: true, roomID: {allofterms: "${roomID}"}}) {
                id
                username
                roomID
                userCharacter
                points
                isCorrectGuess
            }
        }
    `, 
    variables: 'id username roomID userCharacter points isCorrectGuess' 
  });

const checkIfNameExistsInRoom = async (roomID, username) => {
	const room = await getAllUsersInRoom(roomID);
	const user = room.filter((user) => user.username === username)[0];
	return user;
};

const emitUserIsCorrect = async ({ userID, drawerUserID, io, roomID }) => {

    const usersInRoom = await getAllUsersInRoom(roomID);
    const drawer = await getUser(drawerUserID);
    const user = await getUser(userID);
    
    if (user[0] && drawer[0]) {
        await updateUserWasCorrect({ id: userID, points: user[0].points + 3 });
        await updateDrawer({ id: drawerUserID, points: drawer[0].points + 1 });
        io.in(roomID).emit('GET_USERS', usersInRoom);
        io.in(roomID).emit('MESSAGE', {
            type: 'SERVER-GUESSED_CORRECT_WORD',
            content: `${user[0].username} guessed the word! 👏`,
        });
    };

};

module.exports = {
	addUser,
	deleteUser,
	getUser,
	checkIfNameExistsInRoom,
    getAllUsersInRoom,
    getAllUsersInLobby,
	getAllUsersInRoomWhoGuessedCorrectly,
    emitUserIsCorrect,
    updateUserWasCorrect,
};
