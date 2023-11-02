import * as React from 'react';
import Greetings from './components/Greetings';
import Timer from './components/Timer';

function App() {
    return (
        <React.StrictMode>
            <Greetings />
            <Timer
                seconds={180}
                remainSeconds={180}
            />
        </React.StrictMode>
    );
}

export default App;
