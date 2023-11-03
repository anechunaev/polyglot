import * as React from 'react';
import Greetings from './components/Greetings';
import Timer from './components/TurnTimer';
import NoSSR from './components/NoSSR';
import GameList from './components/GameList';
import './styles/palette.css';

function App() {
	return (
		<React.StrictMode>
			<Greetings />
			<Timer seconds={180} remainSeconds={180} />
			<NoSSR>
				<GameList />
			</NoSSR>
		</React.StrictMode>
	);
}

export default App;
