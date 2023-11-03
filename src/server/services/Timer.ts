
export interface ITimerInstance {
    start: () => void;
    time: number;
    total: number;
}

export class Timer implements ITimerInstance {
    public time: number;
    public total: number;
    private onUpdateTime: (time: number, total: number) => void;
    private onFinish: () => void;

    constructor (time: number, onUpdateTime: (time: number, total: number) => void, onFinish: () => void) {
        this.time = time;
        this.total = time;
        this.onUpdateTime = onUpdateTime;
        this.onFinish = onFinish;
    }

    public start() {
        const intervalId = setInterval(() => {
            --this.time;

            if (this.time > 0) {
                this.onUpdateTime(this.time, this.total);
            } else {
                this.onFinish();
                clearInterval(intervalId);
            }
        }, 1000);
    }
}