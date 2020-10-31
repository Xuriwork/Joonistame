import { gql } from '@apollo/client';

const ADD_ROOM = gql`
  mutation addRoom($roomID: String!, $drawer: String!) {
    addRoom(input: [{ roomID: $roomID, drawer: $drawer }]) {
      room {
        roomID
        drawer
      }
    }
  }
`;

const GET_ROOM = gql`
  query User($roomID: String!) {
    queryRoom(filter: {roomID: {anyofterms: $roomID}}) {
        drawer,
        roomID,
    }
  }
`;

const ADD_USER = gql`
  mutation addUser($id: String!, $username: String!, $roomID: String!, $userCharacter: String!) {
    addUser(input: [{ id: $id, username: $username, roomID: $roomID, userCharacter: $userCharacter, points: 0 }]) {
      user {
        id,
        username,
        roomID,
        userCharacter,
        points
      }
    }
  }
`;

const GET_USERS = gql`
  subscription User($filter: UserFilter) {
    queryUser(filter: $filter) {
        id,
        username,
        roomID,
        userCharacter,
    }
  }
`;

export { ADD_ROOM, GET_ROOM, ADD_USER, GET_USERS };