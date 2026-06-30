'use client';
import { useCallback, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {parseDashboardFilters,type DashboardFilters,type StatusFilter,type SortField,type MonthKey}from '../schemas/dashboard-filters';

export function useDashboardFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const filters:DashboardFilters=useMemo(()=>parseDashboardFilters(searchParams),[searchParams])

    const updateFilters=useCallback(
        (patch:Partial<DashboardFilters>)=>{
            const next ={...filters,...patch};
            const params=new URLSearchParams()
            params.set('month',next.month)
            params.set('status',next.status);
            params.set('sortField',next.sortField)
            params.set('sortDirection',next.sortDirection)
            if(next.search)params.set('search',next.search)
            router.replace(`${pathname}?${params.toString()}`)
        },[filters,pathname,router]
    )

    const setMonth=useCallback((month:MonthKey) => updateFilters({month}),[updateFilters])

    const setStatus=useCallback((status:StatusFilter)=>updateFilters({status}),[updateFilters])

    const setSearch = useCallback((search:string)=>updateFilters({search}),[updateFilters]);

    const toggleSort =useCallback((field:SortField) =>{
        if(filters.sortField == field){
            updateFilters({sortDirection:filters.sortDirection=='asc'?'desc' :'asc'});
        }else{
            updateFilters({sortField:field,sortDirection:'desc'});
        }
        },[filters.sortField,filters.sortDirection,updateFilters]
    )

    return {filters,setMonth,setStatus,setSearch,toggleSort,updateFilters};
}