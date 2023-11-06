import * as React from 'react';
import {h32} from 'xxhashjs';
import type { IProps as ICellProps } from '../components/Cell/view';
import Sidebar from '../components/Sidebar';
import Field from '../components/Field';
import Cell from '../components/Cell';
import schema from './schema.json';
import withStyles from '../components/withStyles';
import styles from './gameStyles.scss';

interface IProps {
    classes: Record<string, string>;
}

function GamePage({classes}: IProps) {
    return (
        <div className={classes.game}>
            <Field>
                {(schema as ICellProps['bonus'][][]).map((row, index) => (
                    <div
                        key={h32(JSON.stringify(row) + index, 0xabcd).toString()}
                        style={{ width: '610px', gap: '1px', display: 'flex', margin: 0 }}
                    >
                        {row.map((bonus, i) => (
                            <Cell key={h32((bonus || '') + i, 0xabcd).toString()} bonus={bonus} />
                        ))}
                    </div>
                ))}
            </Field>
            <Sidebar />;
        </div>
    );
}

export default withStyles(GamePage, styles);
