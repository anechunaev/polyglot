import { createContext } from 'react';
import { EventBus } from './transport/eventBus';

const eventBus = new EventBus();
const EventBusContext = createContext<any>(eventBus);

export default EventBusContext;
