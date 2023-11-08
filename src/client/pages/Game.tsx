import * as React from 'react';
import { h32 } from 'xxhashjs';
import type { IProps as ICellProps } from '../components/Cell/view';
import { DndContext } from '@dnd-kit/core';
import Sidebar from '../components/Sidebar';
import Field from '../components/Field';
import DroppableCell from '../components/DroppableCell';
import DraggableLetter from '../components/DraggableLetter';
import Letter from '../components/Letter';
import Cell from '../components/Cell';
import schema from './schema.json';
import withStyles from '../components/withStyles';
import styles from './gameStyles.scss';

import data from './data.json';

// get letters for the each player
const { letters }: {letters: string[]} = (data as any).players[data.active_player];

interface IProps {
    classes: Record<string, string>;
}

function GamePage({ classes }: IProps) {
    const [dropped, setDropped] = React.useState(null);
    const [droppedLetters, setDroppedLetters] = React.useState<Record<string, any>>({});
    const [letterIds, updateLetterIds] = React.useState<string[]>(letters);

    const handleDragEnd = ({over, active}: any) => {
        console.log('--handleDragEnd---', over, active);
        // setDropped(over ? over.id : null);
        if (over) {
            setDroppedLetters(state => ({
                ...state,
                [over.id]: active.id
            }));
            updateLetterIds(state => {
                const letterIndex = state.indexOf(active.id);

                if (letterIndex !== -1) {
                    const newState = [...state];

                    newState.splice(letterIndex, 1);

					return newState;
                }

                return state;
            });
        }
    }

    const renderDroppedLetter = React.useCallback((id: string) => {
        const letterId = droppedLetters[id];

        console.log('---renderDroppedLetter-----', id, droppedLetters);

        if (letterId) {
            updateLetterIds(state => {
                const letterIndex = state.indexOf(letterId);

                if (letterIndex !== -1) {
                    const newState = [...state];

                    newState.splice(letterIndex, 1);

					return newState;
                }

                return state;
            });

            const letter =  (data as any).letters[letterId];

            return (
                <Letter
                letterId={letterId}
                // letter={{ price: letter.price, value: letter.value }}
            />
            )
        }

        return null;
    }, [droppedLetters, letterIds]);

    return (
        <div className={classes.game}>
            <DndContext onDragEnd={handleDragEnd}>
                <Field>
                    {(schema as ICellProps['bonus'][][]).map((row, index) => (
                        <div
                            key={h32(JSON.stringify(row) + index, 0xabcd).toString()}
                            style={{ width: '610px', gap: '1px', display: 'flex', margin: 0 }}
                        >
                            {row.map((bonus, i) => {
                                const id = i.toString() + index.toString();
                                return (
                                    <DroppableCell
                                        key={h32((bonus || '') + i, 0xabcd).toString()}
                                        id={id}
                                        bonus={bonus}
                                    >
                                        {droppedLetters[id] && <DraggableLetter letterId={droppedLetters[id]} />}
                                    </DroppableCell>
                                );
                            }
                            )}
                        </div>
                    ))}
                </Field>
                <Sidebar letterIds={letterIds}/>
            </DndContext>
        </div>
    );
}

GamePage.displayName = 'GamePage';

export default withStyles(GamePage, styles);
