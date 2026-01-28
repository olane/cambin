import React, { useState, FC } from 'react';
import Calendar from 'react-calendar';
import '../styles/calendar.css';
import { TileClassNameFunc, Value } from 'react-calendar/dist/cjs/shared/types';
import { BinSchedule, RoundType } from '../model/BinTypes';
import { isSameDate } from '../utils/dateUtils';
import { UpcomingCollectionsProps } from './UpcomingCollections';

type BinColourClass = 'black' | 'green' | 'blue' | 'brown';

const ROUND_TYPE_ORDER: Record<RoundType, number> = {
    DOMESTIC: 0,
    ORGANIC: 1,
    RECYCLE: 2,
    FOOD: 3,
};

function roundTypeToColourClass(roundType: RoundType): BinColourClass {
    switch (roundType) {
        case 'DOMESTIC':
            return 'black';
        case 'ORGANIC':
            return 'green';
        case 'RECYCLE':
            return 'blue';
        case 'FOOD':
            return 'brown';
    }
}

function normalizeRoundTypes(roundTypes: RoundType[]): RoundType[] {
    // Ensure stable ordering + no duplicates (so CSS stays deterministic)
    const unique = Array.from(new Set(roundTypes));
    unique.sort((a, b) => ROUND_TYPE_ORDER[a] - ROUND_TYPE_ORDER[b]);
    return unique;
}

const getTileClassNameFunc = (schedule: BinSchedule) => {
    const tileClassName: TileClassNameFunc = ({ date, view }) => {
        // Check if a date React-Calendar wants to check is one of our collections
        var collection = schedule.collections.find(collection => isSameDate(collection.date, date));

        if (collection !== undefined) {
            const normalizedRoundTypes = normalizeRoundTypes(collection.roundTypes).slice(0, 3);
            const colourClasses = normalizedRoundTypes.map(roundTypeToColourClass);

            const slotClasses = colourClasses.map((c, i) => `bin-${i + 1}-${c}`);
            const countClass = `bin-count-${colourClasses.length}`;

            return `calendar-bin-day ${countClass} ${slotClasses.join(' ')}`;
        }
    }

    return tileClassName;
}

export const UpcomingCollectionsCalendar: FC<UpcomingCollectionsProps> = ({schedule, address}) => {
    const [value, setValue] = useState<Value>(new Date());

    function onChange(nextValue: Value) {
        setValue(nextValue);
    }

    const tileClassNameFunc = getTileClassNameFunc(schedule);

    return (
        <Calendar
            onChange={onChange}
            value={value}
            tileClassName={tileClassNameFunc}
            className='collections-calendar'
            minDetail='month'
            prev2Label={null}
            next2Label={null}
        />
    );
}
