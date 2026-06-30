'use client'
import type {MonthKey} from '../lib/schemas/dashboard-filters'
import {formatMonthLabel} from '../lib/utils/months'

interface MonthSelectorProps{
  months:MonthKey[]
  selected:MonthKey
  onSelect:(month:MonthKey) =>void
}

export function MonthSelector({months,selected,onSelect}:MonthSelectorProps){
  return(
    <main className="flex gap-1 rounded-lg bg-gray-100 p-1" role="tablist" aria-label="Select month">
      {months.map((month)=>{
        const isActive=month==selected
        return(
          <button key={month} role="tab"aria-selected={isActive} onClick={()=>onSelect(month)}className={`rounded-md px-4 py-1.5 text-xs md:text-sm font-medium transition-colors cursor-pointer ${isActive?'bg-white text-gray-900 shadow-sm':'text-gray-500 hover:text-gray-700'}`}>{formatMonthLabel(month)}</button>
        )
      })}
    </main>
  )
}