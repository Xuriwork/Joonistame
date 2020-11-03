const fetch = require("node-fetch");

const GRAPH_ENDPOINT = 'https://superb-kick.us-west-2.aws.cloud.dgraph.io/graphql';

const fetchGraphQL = async (query) => {
  const result = await fetch(
    GRAPH_ENDPOINT,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
    }
  );
  return await result.json();
};

const sendQuery = async({ operationName, query, variables }) => {
  const { errors, data } = await fetchGraphQL(query);

  if (errors) console.error(errors);
  
  console.log(data[operationName]);
};

const sendMutation = async ({ operationName, mutation, variables }) => {
  const { errors, data } = await fetchGraphQL(mutation);

  if (errors) console.error(errors);
  
  console.log(data[operationName]);
};

const schema = {
  Query: {
    allUsersQuery: `
      query {
        queryUser {
          id
          username
          roomID
          userCharacter
          points
        }
      }
    `,
    getAllUsersInRoom: (roomID) => `
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
    getUserQuery: (id) => `
        query {
          queryUser(filter: {id: {allofterms: "${id}"}}) {
            id
            username
            roomID
            userCharacter
            points
          }
        }
    `,
    allRoomsQuery: `
      query {
        queryRoom {
          roomID,
          drawer,
          users {
            username,
            id
          }
        }
      }
    `,
    getRoomQuery: (roomID) => `
        query {
          queryRoom(filter: {roomID: {allofterms: "${roomID}"}}) {
            roomID,
            drawer,
            users {
              username,
              id
            }
          }
        }
    `,
  },
  Mutation: {
    addUserMutation: (args) => `
      mutation {
        addUser(input: [{ id: "${args.id}", username: "${args.username}", roomID: "${args.roomID}", userCharacter: "${args.userCharacter}", points: 0, isCorrectGuess: false }]) {
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
    addRoomMutation: ({ roomID, drawer, maxRoomSize, word }) => `
      mutation {
        addRoom(input: [{ roomID: "${roomID}", drawer: "${drawer}", maxRoomSize: ${maxRoomSize}, word: "${word}" }]) {
          room {
            roomID,
            drawer,
            users {
              id
              username,
            }
          }
        }
      }
    `,
  }
};

const resolvers = {
  Query: {
    getAllUsers: async (query) => sendQuery({ 
      operationName: 'queryUser', 
      query,
      variables: 'id username roomID userCharacter points isCorrectGuess' 
    }),
    getUser: async (query) => sendQuery({ 
      operationName: 'queryUser', 
      query, 
      variables: 'id username roomID userCharacter points isCorrectGuess' 
    }),
    getLobby: async (query) => sendQuery({ 
      name: 'queryLobby', 
      query, 
      variables: 'roomID drawer, maxLobbySize, users: { username, id }' 
    }),
    getRoom: async (query) => sendQuery({ 
      operationName: 'queryRoom', 
      query, 
      variables: 'roomID drawer, maxRoomSize, word' 
    })
  },
  Mutation: {
    addUser: async (mutation) => sendMutation({ 
        operationName: 'addUser', 
        mutation,
        variables: 'id username roomID userCharacter points isCorrectGuess'
    }),
    addRoom: async (mutation) => sendMutation({ 
      operationName: 'addRoom', 
      mutation,
      variables: 'roomID drawer maxRoomSize word'
    }),
  }
};

//resolvers.Mutation.addUser(schema.Mutation.addUserMutation({id: "Test", username: "Test", roomID: "Test", userCharacter: "Test", points: 10, isCorrectGuess: false}));
//resolvers.Mutation.addRoom(schema.Mutation.addRoomMutation({ roomID: "Test", drawer: "Test", maxRoomSize: 20, word: null }));
resolvers.Query.getUser(schema.Query.getAllUsersInRoom('Test'));