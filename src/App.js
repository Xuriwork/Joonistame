import { useState } from 'react';
import { BrowserRouter as Router, Switch } from 'react-router-dom';

import './App.scss';

import { SocketProvider } from './context/SocketContext';

import { PrivateRoute, PublicRoute } from './components/Routes';
import CharacterEditor from './components/CharacterEditor/CharacterEditor.js';
import Join from './pages/Join';
import GameRoom from './pages/GameRoom';
import Lobby from './pages/Lobby';
import ChooseWordModal from './components/Modal/ChooseWordModal';

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
							path='/room'
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
					</Switch>
				</Router>
			</div>
		</SocketProvider>
	);
};

export default App;
