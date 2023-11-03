import React from 'react';
import clsx from 'clsx';
import TimerIcon from './assets/timer.svg';

export interface IProps {
    remainMs: number;
    initialMs: number;
    threshold?: number;
}

export interface IEncapsulatedProps extends IProps {
    classes: Record<string, string>;
}

function numPad(n: number): string {
    return n.toString().padStart(2, '0');
}

function formatTime(seconds: number): string {
    const date = new Date(seconds * 1000);
    return `${numPad(date.getMinutes())}:${numPad(date.getSeconds())}`;
}

function TimerView({ classes, remainMs, initialMs, threshold = 30 }: IEncapsulatedProps) {
    return (
        <div className={classes.container}>
            <span className={clsx({
                [classes.highlighted]: true,
                [classes.threshold]: remainMs <= threshold,
            })}>
                <img
                    src={TimerIcon}
                    alt="⏱️"
                    className={classes.icon}
                />
                { formatTime(remainMs) }
            </span>
            &ensp;/&ensp;
            { formatTime(initialMs) }
        </div>
    );
}

TimerView.displayName = "TimerView";

export default TimerView;
