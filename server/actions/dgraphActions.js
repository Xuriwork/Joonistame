const fetch = require('node-fetch');
const GRAPH_ENDPOINT = 'https://superb-kick.us-west-2.aws.cloud.dgraph.io/graphql';

const fetchGraphQL = async (operation) => {
  const result = await fetch(
    GRAPH_ENDPOINT,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: operation })
    }
  );
  return await result.json();
};

const sendQuery = async({ operationName, query }) => {
  const { errors, data } = await fetchGraphQL(query);

  if (errors) console.error(errors);
  
  return data[operationName];
};

const sendMutation = async ({ operationName, mutation }) => {
  const { errors, data } = await fetchGraphQL(mutation);

  if (errors) console.error(errors);
  
  return data[operationName];
};

module.exports = {
	sendMutation,
    sendQuery
};
