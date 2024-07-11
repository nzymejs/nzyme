import { jest } from '@jest/globals';
import { add, type Duration } from 'date-fns';

export function advanceTime(duration: Duration) {
    const newDate = add(new Date(), duration);
    jest.setSystemTime(newDate);
    return newDate;
}
