import * as React from 'react';
import type { IProps as IViewProps } from './view';

export interface IProps {
	ms: number;
    remainMs: number;
    threshold?: number;
}

function Model(View: React.ComponentType<IViewProps>): React.ComponentType<IProps> {
	return function TimerModel({ ms = 0, remainMs = 0, threshold = 30 }: IProps) {
        const [ remainMsState, setRemainMsState ] = React.useState(remainMs);
        const [ prevMs, setPrevMs ] = React.useState<null | number>(null);
        const [ prevRemainMs, setPrevRemainMs ] = React.useState<null | number>(null);
    
        React.useEffect(() => {
            const intervalId = setInterval(() => {
                if (remainMsState > 0) {
                    setRemainMsState(remainMsState - 1);
                } else {
                    setRemainMsState(0);
                    clearInterval(intervalId);
                }
            }, 1000);
    
            return () => clearInterval(intervalId);
        }, [ remainMsState ]);
    
        if (ms !== prevMs || remainMs !== prevRemainMs) {
            setRemainMsState(remainMs);
            setPrevMs(ms);
            setPrevRemainMs(remainMs);
        }

        return (
            <View
                remainMs={remainMsState}
                initialMs={ms}
                threshold={threshold}
            />
        );
    };
}

export default Model;
