import { useState } from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';

import './App.scss';

import Join from './pages/Join';
import Room from './pages/Room';

const App = () => {
  const [info, setInfo] = useState({});
	const [authorized, setAuthorized] = useState(false);

	const handleSetCredentials = (username, roomName) => {
		username = username.trim();
		roomName = roomName.trim();
    setInfo({ username, roomName });
	};

  return (
		<div className='app-component'>
			<Router>
				<Switch>
					<Route
						exact
						path='/'
						component={() => (
							<Room
								authorized={authorized}
								setAuthorized={setAuthorized}
								username={info.username}
								roomName={info.roomName}
							/>
						)}
					/>
					<Route
						path='/join'
						component={() => (
							<Join
								setAuthorized={setAuthorized}
								handleSetCredentials={handleSetCredentials}
							/>
						)}
					/>
					<Redirect from='/**' to='/join' />
				</Switch>
			</Router>
		</div>
	);
};

export default App;
