import * as React from 'react';

import { IProps as ILetterProps } from '../Letter/view';

export interface IProps {
	onMouseUp: (event: any) => void;
	onMouseDown: (event: any) => void;
	onMouseMove: (event: any) => void;
}

function Model(
	View: React.ForwardRefExoticComponent<React.PropsWithoutRef<ILetterProps & IProps> & React.RefAttributes<unknown>>,
): React.ComponentType<ILetterProps> {
	function DraggabaleLetterModel(props: ILetterProps) {
		// const [transform, setTransform] = React.useState<{ x: number; y: number }>();
		const [isMoving, setIsMoving] = React.useState(false);
		const ref = React.createRef<HTMLDivElement>();

		const onMouseDown = (event: any) => {
			console.log(event);
			setIsMoving(true);

			if (ref && ref.current) {
				const rect = ref.current.getBoundingClientRect();
				console.log(rect);
			}
		};

		const onMouseUp = (event: any) => {
			console.log(event);
			setIsMoving(false);
		};
		const onMouseMove = React.useCallback(
			(event: any) => {
				if (isMoving) {
					console.log(event);
				}
			},
			[isMoving],
		);

		return <View {...props} ref={ref} onMouseUp={onMouseUp} onMouseMove={onMouseMove} onMouseDown={onMouseDown} />;
	}

	return DraggabaleLetterModel;
}

export default Model;
