import * as React from 'react';
import { createPortal } from 'react-dom';
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

const FIELD_POSITION_START_X = 20;
const FIELD_POSITION_START_Y = 9;

const LETTERS_POSITION_START_X = 684;
const LETTERS_POSITION_START_Y = 73

function GamePage({ }: IProps) {
    const [fieldLetters, setFieldLetters] = React.useState<string>("{}");
    const mouseSensor = useSensor(MouseSensor, {
        activationConstraint: {
            distance: 10
        }
    });

    const handleDragEnd = ({ over, active }: DragEndEvent) => {
        if (over) {
            const letterId = active.id;
            const { position } = over.data.current as any;

            setFieldLetters(state => {
                const parsedState = JSON.parse(state);
                parsedState[letterId] = {
                    top: FIELD_POSITION_START_Y + (40 * position.y + position.y),
                    left:FIELD_POSITION_START_X + (40 * (position.x + 1) + ((position.x + 1) - 2))
                }

                return JSON.stringify(parsedState);
            });
        }
    }

    const lettersContent = React.useMemo(() => {
        const droppedLetters = JSON.parse(fieldLetters);
        return (
            <div className={styles.lettersContainer}>
            {letters.map((letterId, i) => {
                const droppedLetterPosition = droppedLetters[letterId];

                return (
                    <DraggableLetter
                        key={h32(letterId, 0xabcd).toString()}
                        styles={{
                            top: droppedLetterPosition ? droppedLetterPosition.top : LETTERS_POSITION_START_Y,
                            left: droppedLetterPosition ? droppedLetterPosition.left : LETTERS_POSITION_START_X + (40 * (i + 1) + (i + 1))
                        }}
                        letterId={letterId}
                        onClick={() => { }}
                    />
                )
            })}
        </div>
        );
    }, [fieldLetters]);

    return (
        <div className={styles.game}>
            <DndContext onDragEnd={handleDragEnd} sensors={useSensors(mouseSensor)}>
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
                                        position={{
                                            x: i,
                                            y: index
                                        }}
                                        key={h32((bonus || '') + id + "dr-cell", 0xabcd).toString()}
                                        bonus={bonus}
                                    >
                                    </DroppableCell>
                                );
                            }
                            )}
                        </div>
                    ))}
                </Field>
                <Sidebar />
                {
                    createPortal(lettersContent, document.body)
                }
            </DndContext>
        </div>
    );
}

GamePage.displayName = 'GamePage';

export default GamePage;
