import type { GameId } from './GameEngine';

export interface IServiceBus {
    emit: (gameId: GameId, payload: Record<string, any>) => void;
};

export class ServiceBus implements IServiceBus {
    constructor() { }

    public subscribe() { }
    public unsubscribe() { }

    public emit(gameId: GameId, payload: Record<string, any>) { }
}