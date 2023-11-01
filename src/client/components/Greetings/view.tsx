import * as React from 'react';
import styles from './styles.scss';
import SparklesImage from './assets/sparkles.svg';

export interface IProps {}

function GreetingsView(_props: IProps) {
    return (
        <section className={styles.container}>
            <img className={styles.illustration} alt="✨" src={SparklesImage} />
            <h1 className={styles.header}>
                Welcome!
            </h1>
            <p className={styles.text}>
                Lorem ipsum dolor sit amet
            </p>
        </section>
    );
}

export default GreetingsView;
