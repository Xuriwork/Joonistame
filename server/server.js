const fetch = require("node-fetch");

const GRAPH_ENDPOINT = 'https://superb-kick.us-west-2.aws.cloud.dgraph.io/graphql';

const fetchGraphQL = async (operation) => {
  const result = await fetch(
    GRAPH_ENDPOINT,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query: operation })
    }
  );
  return await result.json();
};

const sendQuery = async({ operationName, query }) => {
  const { errors, data } = await fetchGraphQL(query);

  if (errors) console.error(errors);
  
  console.log(data);
};

const sendMutation = async ({ operationName, mutation }) => {
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
          isCorrectGuess
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
  },
};

const resolvers = {
  Query: {
    getAllUsers: async (query) => sendQuery({ 
      operationName: 'queryUser', 
      query,
      variables: 'id username roomID userCharacter points isCorrectGuess' 
    }),
  },
  Mutation: {
    addUserToLobby: async (mutation) => sendMutation({ 
      operationName: 'addUser', 
      mutation,
      variables: 'lobbyID drawer maxLobbySize'
    }),
  }
};

//resolvers.Mutation.addUser(schema.Mutation.addUserMutation({id: "Test", username: "Test", roomID: "Test", userCharacter: "Test", points: 10, isCorrectGuess: false}));
//resolvers.Mutation.addRoom(schema.Mutation.addRoomMutation({ roomID: "Test", drawer: "Test", maxRoomSize: 20, word: null }));
//resolvers.Mutation.addRoom(schema.Mutation.addRoomMutation({ roomID: 'Test', drawer: 'Test', word: 'Test' }));
//resolvers.Query.getUser(schema.Query.getUserQuery('Test'));