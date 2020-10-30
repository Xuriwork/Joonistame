import { ApolloClient } from '@apollo/client/core';
import { getMainDefinition } from '@apollo/client/utilities';
import { InMemoryCache } from '@apollo/client/cache';
import { HttpLink, split } from '@apollo/client';
import { WebSocketLink } from '@apollo/link-ws';

const endpoint = 'superb-kick.us-west-2.aws.cloud.dgraph.io/graphql';

const wsLink = new WebSocketLink({
    uri: `wss://${endpoint}`,
    options: {
        reconnect: true
    }
});

const httpLink = new HttpLink({
    uri: `https://${endpoint}`
});

const link = split(
	({ query }) => {
		const definition = getMainDefinition(query);
		return (
			definition.kind === 'OperationDefinition' &&
			definition.operation === 'subscription'
		);
	},
	wsLink,
	httpLink
);

export default new ApolloClient({
    cache: new InMemoryCache(),
    link
});

