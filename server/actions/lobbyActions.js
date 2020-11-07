const { sendMutation, sendQuery } = require('./dgraphActions');

const getLobby = async (lobbyID) =>
	sendQuery({
		operationName: 'queryLobby',
		query: `
            query {
                queryLobby(filter: {lobbyID: {allofterms: "${lobbyID}"}}) {
                    lobbyID,
                    drawer,
                    users {
                        id,
                        username,
                        userCharacter,
                    }
                }
            }
        `,
		variables: 'lobbyID drawer, maxLobbySize, users: { username, id }',
	})[0];

const addLobby = async ({ lobbyID, drawer }) =>
	sendMutation({
		operationName: 'addLobby',
        mutation: `
            mutation {
                addLobby(input: [{ lobbyID: "${lobbyID}", drawer: "${drawer}", maxLobbySize: 10, users: [] }]) {
                    lobby {
                        lobbyID,
                        drawer,
                        users {
                            id,
                            username,
                            userCharacter
                        }
                    }
                }
            }
        `,
		variables: 'lobbyID drawer maxLobbySize',
	});

const deleteLobby = async (lobbyID) =>
	sendMutation({
		operationName: 'deleteLobby',
		mutation: `
        mutation {
                    deleteLobby(filter: {lobbyID: {allofterms: "${lobbyID}"}}) {
                    drawer,
                    lobby {
                        lobbyID
                    }
                }
            }
        `,
		variables: 'lobbyID',
    });
    
const addUserToLobby = async ({ lobbyID, user }) => sendMutation({
    operationName: 'updateLobby',
    mutation: `
        mutation {
            updateLobby(input: {filter: {lobbyID: { allofterms: "${lobbyID}" }}, set: {users: {id: "${user.id}", username: "${user.username}" , userCharacter: "${user.userCharacter}" }}}) {
                lobby {
                    lobbyID
                    maxLobbySize
                    users {
                        id,
                        username,
                        userCharacter,
                    }
                }
            }
        }
    `,
    variables: 'lobbyID',
})

// const addUserToLobby = (user) => {
// 	const lobby = getLobby(user.roomID);
// 	lobby.users.push(user);
// };

const checkIfNameExistsInLobby = (users, username) => {
    console.log(users, username);
	const user = users.filter((user) => user.username === username)[0];
	if (user) return true;
	else return false;
};

module.exports = {
	addLobby,
	getLobby,
	deleteLobby,
    checkIfNameExistsInLobby,
    addUserToLobby
};
