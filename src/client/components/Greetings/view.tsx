import * as React from 'react';
import SparklesImage from './assets/sparkles.svg';

export interface IProps {}

export interface IEncapsulatedProps extends IProps {
	classes: Record<string, string>;
}

function GreetingsView({ classes }: IEncapsulatedProps) {
	return (
		<section className={classes.container}>
			<img className={classes.illustration} alt="✨" src={SparklesImage} />
			<h1 className={classes.header}>Welcome!</h1>
			<p className={classes.text}>Lorem ipsum dolor sit amet</p>
		</section>
	);
}

export default GreetingsView;
