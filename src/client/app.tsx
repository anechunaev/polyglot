import * as React from 'react';
import NoSSR from './components/NoSSR';
import EventBusContext from './eventBusProvider';

import GamePage from './pages/Game';

function App() {
	return (
		<React.StrictMode>
			<NoSSR>
				<EventBusContext.Consumer>
					{eventBus => {
						eventBus.connect();

						return <GamePage eventBus={eventBus} />
					}}
				</EventBusContext.Consumer>
			</NoSSR>
		</React.StrictMode>
	);
}

export default App;
