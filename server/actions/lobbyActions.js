const { sendMutation, sendQuery } = require('./dgraphActions');

const getLobby = async (lobbyID) =>
	sendQuery({
		operationName: 'queryLobby',
		query: `
            query {
                queryLobby(filter: {lobbyID: {allofterms: "${lobbyID}"}}) {
                    lobbyID,
                    host,
                    users {
                        id,
                        username,
                        userCharacter,
                    }
                }
            }
        `,
		variables: 'lobbyID host, maxLobbySize, users: { username, id }',
	});

const addLobby = async ({ lobbyID, host, hostName }) =>
	sendMutation({
		operationName: 'addLobby',
        mutation: `
            mutation {
                addLobby(input: [{ lobbyID: "${lobbyID}", host: "${host}", hostName: "${hostName}", maxLobbySize: 10, users: [] }]) {
                    lobby {
                        lobbyID,
                        host,
                        users {
                            id,
                            username,
                            userCharacter
                        }
                    }
                }
            }
        `,
		variables: 'lobbyID host maxLobbySize',
	});

const deleteLobby = async (lobbyID) =>
	sendMutation({
		operationName: 'deleteLobby',
		mutation: `
            mutation {
                deleteLobby(filter: {lobbyID: {allofterms: "${lobbyID}"}}) {
                    host,
                    hostName,
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
