import * as React from 'react';
import { h32 } from 'xxhashjs';
import { DndContext, MouseSensor, useSensor, useSensors, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { IProps as ICellProps } from '../components/Cell/view';
import Sidebar from '../components/Sidebar';
import Field from '../components/Field';
import DroppableCell from '../components/DroppableCell';
import DraggableLetter from '../components/DraggableLetter';
import schema from './schema.json';
import styles from './gameStyles.scss';

import data from './data.json';

const { letters }: { letters: string[] } = (data as any).players[data.active_player];

interface IProps { }

function GamePage({ }: IProps) {
    const [droppedLetters, setDroppedLetters] = React.useState<Record<string, any>>({});
    const [letterIds, updateLetterIds] = React.useState<(string | null)[]>(letters);
    const mouseSensor = useSensor(MouseSensor, {
        activationConstraint: {
            distance: 10
        }
    });
    const handleDragStart = ({active}: DragStartEvent) => {
        // console.log('-----data----', active);
    }

    const handleDragEnd = ({ over, active }: DragEndEvent) => {
        if (over) {
            setDroppedLetters(state => ({
                ...state,
                [over.id]: active.id
            }));
            updateLetterIds(state => {
                const letterIndex = state.indexOf(active.id as string);

                if (letterIndex !== -1) {
                    const newState = [...state];

                    newState[letterIndex] = null;

                    return newState;
                }

                return state;
            });
        }
    }

    return (
        <div className={styles.game}>
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} sensors={useSensors(mouseSensor)}>
                <Field>
                    {(schema as ICellProps['bonus'][][]).map((row, index) => (
                        <div
                            key={h32(JSON.stringify(row) + index + "row", 0xabcd).toString()}
                            style={{ width: '610px', gap: '1px', display: 'flex', margin: 0 }}
                        >
                            {row.map((bonus, i) => {
                                const id = i.toString() + index.toString();
                                return (
                                    <DroppableCell
                                        id={id}
                                        key={h32((bonus || '') + id + "dr-cell", 0xabcd).toString()}
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
                <Sidebar letterIds={letterIds} />
            </DndContext>
        </div>
    );
}

GamePage.displayName = 'GamePage';

export default GamePage;
