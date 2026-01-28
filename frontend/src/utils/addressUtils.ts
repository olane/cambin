import { AddressSearchResponse } from '../model/BinTypes';

function toCapsCase(str: string) {
    return str
        .split(' ')
        .map(x => x.toLocaleLowerCase())
        .map(x => x.charAt(0).toLocaleUpperCase() + x.slice(1))
        .join(' ');
}

export function addressToString(address: AddressSearchResponse) {
    return `${address.houseNumber} ${toCapsCase(address.street)}`;
}

