import React, {FC, useState} from 'react';
import { AddressSearchResponse, BinSchedule } from '../model/BinTypes';
import { UpcomingCollectionsCalendar } from './UpcomingCollectionsCalendar';
import { UpcomingCollectionsList } from './UpcomingCollectionsList';

export interface UpcomingCollectionsProps {
    schedule: BinSchedule,
    address: AddressSearchResponse
}

export const UpcomingCollections : FC<UpcomingCollectionsProps> = (props) => {
    const [showCalendar, setShowCalendar] = useState(false);
    
    const onToggleView = () => setShowCalendar(x => !x);

    const collectionsElement = showCalendar 
        ? <UpcomingCollectionsCalendar schedule={props.schedule} address={props.address} />
        : <UpcomingCollectionsList schedule={props.schedule} address={props.address} />;

    const buttonText = showCalendar
        ? "Show list"
        : "Show calendar";

    return (
        <>
            {collectionsElement}
            <button className="standard-button secondary toggle-view-button" onClick={onToggleView}>{buttonText}</button>
        </>
    );
}
