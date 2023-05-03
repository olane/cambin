export function isToday(date: Date) {
    const tomorrow = new Date();
    return isSameDate(date, tomorrow);
}

export function isTomorrow(date: Date) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return isSameDate(date, tomorrow);
}

export function isThisWeek(date: Date) {
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);

    const startOfWeek = getFirstDayOfWeek(now, 1);
    const startOfNextWeek = getFirstDayOfWeek(nextWeek, 1);

    return date > startOfWeek && date < startOfNextWeek;
}

function isSameDate(date1: Date, date2: Date) {
    return date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear();
}

// firstDayOfWeekIndex: 0 for Sunday, 1 for Monday, etc.
function getFirstDayOfWeek(dateObject: Date, firstDayOfWeekIndex: number): Date {
    const dayOfWeek = dateObject.getDay();
    const firstDayOfWeek = new Date(dateObject);

    const diff = dayOfWeek >= firstDayOfWeekIndex 
        ? dayOfWeek - firstDayOfWeekIndex
        : 6 - dayOfWeek;

    firstDayOfWeek.setDate(dateObject.getDate() - diff)
    firstDayOfWeek.setHours(0,0,0,0)

    return firstDayOfWeek
}

