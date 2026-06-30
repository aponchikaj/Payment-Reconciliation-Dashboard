'use client'
import { useMemo } from 'react';
import { useTransactions } from '../lib/hooks/use-transactions'
import {useCompanies} from '../lib/hooks/use-companies';
import { useRunMatching } from '../lib/hooks/use-run-matching'
import { useDashboardFilters } from '../lib/hooks/use-dashboard-filters';
import {distinctMonthKeys,isInMonth} from '../lib/utils/months'
import { MonthSelector} from '../components/month-selector'
import {StatsBar} from '../components/status-bar'
import {TransactionsTable} from '../components/transactions-table'
import type {Company} from'../types/database'
import { useContracts } from '../lib/hooks/use-contracts'
import { computeExpectedVsActual } from '../lib/utils/expected-vs-actual'
import { ExpectedVsActual } from '../components/expected-vs-actual'

export function DashboardContent() {
  const {data:transactions,isLoading:txLoading,isError:txError,error:txErrorObj} =useTransactions()
  const {data:companies,isLoading:companiesLoading} = useCompanies();
  const runMatching=useRunMatching()
  const {filters,setMonth,setStatus,toggleSort} =useDashboardFilters()
  const {data:contracts,isLoading:contractsLoading} = useContracts()

  const months=useMemo(()=>(transactions?distinctMonthKeys(transactions.map((t)=>t.entry_date)):[]),[transactions])
  const activeMonth =months.includes(filters.month)?filters.month :months[0]

  const monthTransactions =useMemo(()=>{
  if (!transactions ||!activeMonth) return[]
    return transactions.filter((t)=>isInMonth(t.entry_date,activeMonth))
  },[transactions,activeMonth])

  const companiesById = useMemo(()=>{
    const map= new Map<string,Company>();
    for(const company of companies ??[])map.set(company.id,company)
    return map;
  },[companies])

  const expectedVsActualRows=useMemo(()=>{
    if (!companies|| !contracts ||!transactions||!activeMonth) return[]
    return computeExpectedVsActual(companies,contracts,transactions,activeMonth)
  },[companies,contracts,transactions,activeMonth])

  const isLoading =txLoading||companiesLoading ||contractsLoading

  if(isLoading){
    return (
      <main className="mx-auto max-w-6xl p-6">
        <p className="text-gray-500">Loading</p>
      </main>
    )
  }

  if (txError) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <p className="text-red-600">Failed to load transactions:{txErrorObj instanceof Error?txErrorObj.message:'Unknown errr'}</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="flex flex-col md:flex-row flex-wrap items-start justify-start md:justify-between md:items-center gap-4">
        <section className='flex flex-col text-wrap flex-wrap'>
          <h1 className="text-lg md:text-xl font-semibold">Payment Reconciliation</h1>
          <p className="text-xs md:text-sm text-wrap">Bank transactons matched against client contracts.</p>
        </section>
        <section className="flex items-center gap-3 flex-col md:flex-row items-start">
          {activeMonth&&<MonthSelector months={months}selected={activeMonth} onSelect={setMonth}/>}
          <button onClick={()=>runMatching.mutate()}disabled={runMatching.isPending} className="rounded-md bg-black cursor-pointer hover:scale-110 ease-in-out duration-200 px-4 py-2 text-xs md:text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">{runMatching.isPending ?'Matching…':'Run matching'}</button>
        </section>
      </header>

      {runMatching.isError&&(
        <p className="rounded-md px-4 py-2 text-sm text-red-500">Matching failed:{runMatching.error instanceof Error ? runMatching.error.message : 'Unknown error'}</p>
      )}
      {runMatching.isSuccess &&runMatching.data.matchedCount >0&&(
        <p className="rounded-md px-4 py-2 text-sm text-green-500">Matched {runMatching.data.matchedCount} new transaction{runMatching.data.matchedCount === 1 ? '' : 's'}.</p>
      )}

      <StatsBar transactions={monthTransactions}/>
      <TransactionsTable transactions={monthTransactions} companiesById={companiesById} statusFilter={filters.status} onStatusFilterChange={setStatus} sortField={filters.sortField}sortDirection={filters.sortDirection} onSort={toggleSort}/>
      <ExpectedVsActual rows={expectedVsActualRows}/>
    </main>
  );
}