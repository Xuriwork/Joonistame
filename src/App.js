import { useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import './App.scss';

import { ApolloProvider } from '@apollo/client';
import { SocketProvider } from './context/SocketContext';
import apolloClient from './utils/Apollo/ApolloSetup';

import { PrivateRoute, PublicRoute } from './components/Routes';
import Join from './pages/Join';
import Lobby from './pages/Lobby';
import GameRoom from './pages/GameRoom';
import ChooseWordModal from './components/Modal/ChooseWordModal';
import CharacterEditor from './components/CharacterEditor/CharacterEditor.js';
import NotFoundPage from './components/NotFoundPage';

const App = () => {
	const [info, setInfo] = useState({});
	const [isAuthorized, setIsAuthorized] = useState(false);
	const [userCharacter, setUserCharacter] = useState('');

	const handleSetCredentials = (username, roomID) => {
		username = username.trim();
		roomID = roomID.trim();
    	setInfo({ username, roomID });
	};

  return (
	  <ApolloProvider client={apolloClient}>
			<SocketProvider>
				<div className='app-component'>
					<Router>
						<Switch>
							<PublicRoute 
								exact
								path='/test'
								component={ChooseWordModal}
								isAuthorized={isAuthorized}
								restricted={true}
							/>
							<PublicRoute 
								exact
								path='/'
								component={Join}
								isAuthorized={isAuthorized}
								restricted={true}
								setIsAuthorized={setIsAuthorized}
								handleSetCredentials={handleSetCredentials}
								setUserCharacter={setUserCharacter}
								userCharacter={userCharacter}
							/>
							<PrivateRoute
								path='/game-room'
								component={GameRoom}
								setIsAuthorized={setIsAuthorized}
								username={info.username}
								roomID={info.roomID}
								userCharacter={userCharacter}
								isAuthorized={isAuthorized}
							/>
							<PrivateRoute
								path='/lobby'
								component={Lobby} 
								isAuthorized={isAuthorized}
								setIsAuthorized={setIsAuthorized}
								roomID={info.roomID}
							/>
							<PublicRoute
								path='/join'
								component={Join}
								isAuthorized={isAuthorized}
								restricted={true}
								setIsAuthorized={setIsAuthorized}
								handleSetCredentials={handleSetCredentials}
								setUserCharacter={setUserCharacter}
								userCharacter={userCharacter}
							/>
							<PublicRoute path='/character-editor' component={(props) => <CharacterEditor {...props} />}  setUserCharacter={setUserCharacter} />
							<Route component={NotFoundPage} />
						</Switch>
					</Router>
				</div>
			</SocketProvider>
		</ApolloProvider>
	);
};

export default App;
