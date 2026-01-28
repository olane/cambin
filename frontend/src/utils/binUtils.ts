import { RoundType } from '../model/BinTypes';

export function roundTypeToNiceString(roundType: RoundType): string {
    const roundTypeNameMap: Record<RoundType, string> = {
        ORGANIC: 'green',
        RECYCLE: 'blue',
        DOMESTIC: 'black',
        FOOD: 'food waste',
    };

    return roundTypeNameMap[roundType] ?? 'unknown';
}

