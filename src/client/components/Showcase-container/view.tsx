import * as React from 'react';

export interface IProps {
	children: React.ReactNode;
}

export interface IEncapsulatedProps extends IProps {
	classes: Record<string, string>;
}

function ShowcaseContainer({ children, classes }: IEncapsulatedProps) {
	return <div className={classes.container}>{children}</div>;
}

ShowcaseContainer.displayName = 'ShowcaseContainer';

export default ShowcaseContainer;
