import React, {FC, useState, useEffect} from 'react';
import { AddressSearchResponse, BinSchedule } from '../model/BinTypes';
import { UpcomingCollectionsCalendar } from './UpcomingCollectionsCalendar';
import { UpcomingCollectionsList } from './UpcomingCollectionsList';

export interface UpcomingCollectionsProps {
    schedule: BinSchedule,
    address: AddressSearchResponse
}

const boolToString = (b: boolean) => {
    return b ? 'true' : 'false';
}

const stringToBool = (s: string) => {
    return s === 'true';
}

export const UpcomingCollections : FC<UpcomingCollectionsProps> = (props) => {
    const [showCalendar, setShowCalendar] = useState(false);
    
    const onToggleView = () => {
        localStorage.setItem("showCalendarView", boolToString(!showCalendar));
        setShowCalendar(!showCalendar);
    };

    const collectionsElement = showCalendar 
        ? <UpcomingCollectionsCalendar schedule={props.schedule} address={props.address} />
        : <UpcomingCollectionsList schedule={props.schedule} address={props.address} />;

    const buttonText = showCalendar
        ? "Show list"
        : "Show calendar";


    useEffect(() => {
        const calendarView = localStorage.getItem("showCalendarView");
        if(calendarView != null) {
            setShowCalendar(stringToBool(calendarView));
        }
    }, []);

    return (
        <>
            {collectionsElement}
            <button className="standard-button secondary toggle-view-button" onClick={onToggleView}>{buttonText}</button>
        </>
    );
}
