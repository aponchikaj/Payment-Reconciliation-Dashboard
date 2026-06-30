import type { MonthKey } from '../schemas/dashboard-filters';

export function toMonthKey(isoDate:string):MonthKey{
    return`${isoDate.slice(0, 7)}-01`;
}

export function parseMonthKey(monthKey: MonthKey):{year:number;month:number}{
    const [year,month] =monthKey.split('-').map(Number);
    return {year,month}
}

export function monthBounds(monthKey:MonthKey):{firstDay:string;lastDay:string}{
    const {year,month} = parseMonthKey(monthKey)
    const firstDay=`${monthKey}`;
    const lastDayDate =new Date(year,month,0)
    const lastDay=`${year}-${String(month).padStart(2,'0')}-${String(lastDayDate.getDate()).padStart(2,'0')}`
    return {firstDay,lastDay}
}

export function distinctMonthKeys(entryDates:string[]):MonthKey[]{
    const keys=new Set(entryDates.map(toMonthKey))
    return Array.from(keys).sort();
}

export function formatMonthLabel(monthKey:MonthKey):string{
    const {year,month} = parseMonthKey(monthKey)
    const date=new Date(year,month-1,1)
    return date.toLocaleDateString('en-US',{month:'long',year:'numeric'});
}

export function isInMonth(isoDate:string,monthKey:MonthKey):boolean{
    return toMonthKey(isoDate) == monthKey
}

export function contractOverlapsMonth(contract:{start_date:string;end_date:string| null},monthKey:MonthKey):boolean{
    const {firstDay,lastDay}=monthBounds(monthKey)
    const startsBeforeOrInMonth= contract.start_date<=lastDay;
    const endsAfterOrInMonth=contract.end_date == null||contract.end_date>=firstDay
    return startsBeforeOrInMonth &&endsAfterOrInMonth
}