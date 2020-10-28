import { useState } from 'react';
import { BrowserRouter as Router, Redirect, Switch } from 'react-router-dom';

import './App.scss';

import { PrivateRoute, PublicRoute } from './components/Routes';
import Join from './pages/Join';
import GameRoom from './pages/GameRoom';

const App = () => {
	const [info, setInfo] = useState({});
	const [isAuthorized, setIsAuthorized] = useState(false);

	const handleSetCredentials = (username, roomName) => {
		username = username.trim();
		roomName = roomName.trim();
    	setInfo({ username, roomName });
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
						roomName={info.roomName}
						isAuthorized={isAuthorized}
					/>
					<PublicRoute
						path='/join'
						component={Join}
						isAuthorized={isAuthorized}
						restricted={true}
						setIsAuthorized={setIsAuthorized}
						handleSetCredentials={handleSetCredentials}
					/>
					<Redirect from='/**' to='/join' />
				</Switch>
			</Router>
		</div>
	);
};

export default App;
