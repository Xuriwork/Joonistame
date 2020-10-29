import { useState } from 'react';
import { BrowserRouter as Router, Redirect, Switch } from 'react-router-dom';

import './App.scss';

import { PrivateRoute, PublicRoute } from './components/Routes';
import CharacterEditor from './components/CharacterEditor/CharacterEditor.js';
import Join from './pages/Join';
import GameRoom from './pages/GameRoom';
import Lobby from './pages/Lobby';

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
		<div className='app-component'>
			<Router>
				<Switch>
					<PrivateRoute
						exact
						path='/'
						component={(props) => <GameRoom {...props} />}
						setIsAuthorized={setIsAuthorized}
						username={info.username}
						roomID={info.roomID}
						userCharacter={userCharacter}
						isAuthorized={isAuthorized}
					/>
					<PrivateRoute
						exact
						path='/lobby'
						component={(props) => <Lobby {...props} />} 
						roomID={info.roomID}
						username={info.username}
						setIsAuthorized={setIsAuthorized}
						isAuthorized={isAuthorized}
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
					<Redirect from='/**' to='/join' />
				</Switch>
			</Router>
		</div>
	);
};

export default App;
