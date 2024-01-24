import uuid4 from "uuid4";
import { io, Socket } from 'socket.io-client';

export interface EventBusInstance {
    emit: (eventName: string, payload: Record<string, any>) => void;
    connect: () => Promise<void>;
    on: (eventName: string, listener: any) => void;
}

export class EventBus {
    private socket?: Socket;
    private session_id?: string;

    constructor() {
        // this.session_id = this.initSessionId();
        // // @TODO: add connection url from config
        // this.socket = io("ws://127.0.0.1:8090", {
        //     autoConnect: false,
        //     extraHeaders: {
        //         'X-Session-Id': this.session_id
        //     }
        // })
    };

    private initSessionId() {
        let session_id = window.localStorage.getItem("session_id");

        if (!session_id) {
            session_id = uuid4();
            window.localStorage.setItem("session_id", session_id);
        }

        return session_id;
    }

    public connect() {
        this.session_id = this.initSessionId();
        // @TODO: add connection url from config
        this.socket = io("ws://127.0.0.1:8090", {
            autoConnect: false,
            extraHeaders: {
                'X-Session-Id': this.session_id
            }
        })
        this.socket?.connect();

        console.log('---SOCKET WAS CONNECTED----', this.session_id);
    }



    public on(eventName: string, listener: any) {
        this.socket?.on(eventName, listener);
    }

    public emit(eventName: string, payload: Record<string, any>) {
        this.socket?.emit(eventName,{ sessionId: this.session_id, ...payload });
    }
}