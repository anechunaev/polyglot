
export interface ITimerInstance {
    start: () => void;
}

export class Timer implements ITimerInstance {
    private time: number;
    private total: number;
    private onUpdateTime: (time: number, total: number) => void;
    private onFinish: () => void;

    constructor (time: number, onUpdateTime: (time: number, total: number) => void, onFinish: () => void) {
        this.time = time;
        this.total = time;
        this.onUpdateTime = onUpdateTime;
        this.onFinish = onFinish;
    }

    public start() {
        while (this.time !== 0) {
            setInterval(() => {
                --this.time;

                if (this.time > 0) {
                    this.onUpdateTime(this.time, this.total);
                } else {
                    this.onFinish();
                }
            }, 1000);
        }
    }
}