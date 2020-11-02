const { ApolloServer, gql } = require('apollo-server');
const fetch = require('node-fetch');

const GRAPH_ENDPOINT = 'https://superb-kick.us-west-2.aws.cloud.dgraph.io/graphql';

const typeDefs = gql`
  type User {
      id: String!
      username: String!
      roomID: String!
      userCharacter: String!
      points: Int!
      isCorrectGuess: Boolean!
  }
    
  type Room  {
      roomID: String!
      drawer: String!
      users: [User]
  }

  type Lobby {
      drawer: String! 
      roomID: String!
      maxLobbySize: Int!
      users: [User]
  }

  type Query {
      getUser(id: String!): User
      getAllUsers(roomID: String!): [User]
      getAllUsersInRoomWhoGuessedCorrectly(roomID: String!, isCorrectGuess: Boolean!): [User]
      getLobby(roomID: String!): [Lobby]
      getRoom(roomID: String!): [Room]
  }

  type Mutation {
    addUser(id: String, username: String, roomID: String, userCharacter: String, points: Int): User!
  }
`

const method = 'POST'
const headers = {
  'Content-type': 'application/graphql'
};

const argsToString = (args) => {
  if (typeof args === 'object') { let argStrings = []
      Object.keys(args).forEach((key) => {
      argStrings.push(`${key}:"${args[key]}"`)
    })
    if (argStrings.length) {
      return `${argStrings.join(', ')}`
    }
  }
  return ''
};

const sendQuery = async({ name, args, fields }) => {
  let body = `
query {
  ${name} (${argsToString(args)}) {
    ${fields}
  }
}`
  const fetchResult = await fetch(GRAPH_ENDPOINT, {
    method,
    headers,
    body
  })
  const result = await fetchResult.json()
  return result.data[name]

};

const resolvers = {
  Query: {
    getAllUsers: async () => sendQuery({ name: 'queryUser', fields: 'id username roomID userCharacter points isCorrectGuess' }),
    getUser: async (_parent, args) => sendQuery({ name: 'getUser', args, fields: 'id username roomID userCharacter points isCorrectGuess' }),
    getLobby: async (_parent, args) => sendQuery({ name: 'queryLobby', args, fields: 'drawer roomID maxLobbySize users { drawer roomID maxLobbySize users }' }),
    getRoom: async (_parent, args) => sendQuery({ name: 'queryRoom', args, fields: 'roomID drawer' })
  },
  Mutation: {
    addUser: async (_parent, args) => sendQuery({ name: 'addUser', fields: 'id username roomID userCharacter points isCorrectGuess' }),
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url })=> {
  console.log(`Server ready at at ${url}`)
});