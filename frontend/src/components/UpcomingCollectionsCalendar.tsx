import React, { useState, FC } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { TileClassNameFunc, Value } from 'react-calendar/dist/cjs/shared/types';
import { BinSchedule, RoundType } from '../model/BinTypes';
import { isSameDate } from '../utils/dateUtils';
import { UpcomingCollectionsProps } from './UpcomingCollections';

function roundTypeToClass(roundType: RoundType) {
    switch(roundType){
        case 'DOMESTIC':
            return 'black';
        case 'ORGANIC':
            return 'green';
        case 'RECYCLE':
            return 'blue';
    }
}

const getTileClassNameFunc = (schedule: BinSchedule) => {
    const tileClassName: TileClassNameFunc = ({ date, view }) => {
        // Check if a date React-Calendar wants to check is one of our collections
        var collection = schedule.collections.find(collection => isSameDate(collection.date, date));

        if (collection !== undefined) {
            const classes = collection.roundTypes.map(roundTypeToClass);

            return `calendar-bin-day ${classes.join(" ")}`;
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
