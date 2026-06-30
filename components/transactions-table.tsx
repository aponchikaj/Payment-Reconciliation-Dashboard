'use client'
import type {BankTransaction, Company, TransactionStatus} from '../types/database';
import type { SortField, StatusFilter } from '../lib/schemas/dashboard-filters';
import {StatusBadge} from '../components/status-badge';

interface TransactionsTableProps{
  transactions:BankTransaction[]
  companiesById:Map<string,Company>;
  statusFilter:StatusFilter
  onStatusFilterChange:(status:StatusFilter) =>void
  sortField:SortField
  sortDirection:'asc'|'desc'
  onSort:(field:SortField)=> void
}

const STATUS_OPTIONS:{value:StatusFilter;label:string}[]=[
  {value:'all',label:'All'},
  {value:'matched',label:'Matched'},
  {value:'unmatched',label:'Unmatched' },
  {value:'ignored',label:'Ignored'}
];

function formatGEL(amount:number):string{
  return new Intl.NumberFormat('en-US',{style:'currency',currency:'GEL',maximumFractionDigits:2}).format(amount)
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})
}

export function TransactionsTable({transactions,companiesById,statusFilter,onStatusFilterChange,sortField,sortDirection,onSort}:TransactionsTableProps){
  const filtered =statusFilter=='all'?transactions:transactions.filter((t) =>t.status ==statusFilter)
  const sorted=[...filtered].sort((a,b)=>{
    const aValue=sortField =='amount'?a.amount:a.entry_date;
    const bValue= sortField=='amount'?b.amount:b.entry_date
    const comparison=aValue< bValue?-1:aValue> bValue?1:0
    return sortDirection =='asc' ?comparison:-comparison
  })

  return (
    <main className="mx-auto w-full max-w-6xl rounded-lg border border-gray-200 bg-white">
      <section className="flex flex-col gap-3 border-b border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <h2 className="text-sm font-semibold text-gray-900">Transactions</h2>
        <section className="flex items-center gap-2">
          <label htmlFor="status-filter"className="text-xs text-gray-500">Status</label>
          <select id="status-filter" value={statusFilter} onChange={(e)=>onStatusFilterChange(e.target.value as StatusFilter)}className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-700 sm:w-auto sm:py-1">
            {STATUS_OPTIONS.map((opt)=>(
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </section>
      </section>
      <section className="hidden sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
              <SortableHeader label="Date" field="entry_date" activeField={sortField} direction={sortDirection} onSort={onSort}/>
              <th className="px-4 py-2 font-medium">sender</th>
              <th className="px-4 py-2 font-medium">Tax id</th>
              <SortableHeader label="Amount" field="amount" activeField={sortField} direction={sortDirection} onSort={onSort} align="right"/>
              <th className="px-4 py-2 font-medium">status</th>
              <th className="px-4 py-2 font-medium">matched company</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length ==0?(
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No transactions match the current filters.</td>
              </tr>
            ):(
              sorted.map((tx)=>(<TransactionRow key={tx.id} transaction={tx} companiesById={companiesById}/>))
            )}
          </tbody>
        </table>
      </section>

      <main className="block max-h-[70vh] divide-y divide-gray-100 overflow-y-auto sm:hidden">
        {sorted.length === 0 ? (
          <p className="px-4 py-8 text-center text-gray-400">No transactions match the current filters.</p>
        ) : (
          sorted.map((tx) => (
            <TransactionCard key={tx.id} transaction={tx} companiesById={companiesById} />
          ))
        )}
      </main>
    </main>
  )
}

interface SortableHeaderProps {
  label:string
  field:SortField
  activeField:SortField
  direction:'asc'|'desc';
  onSort:(field:SortField)=>void
  align?:'left'|'right'
}

function SortableHeader({label,field,activeField,direction,onSort,align='left'}:SortableHeaderProps){
  const isActive = field ==activeField
  return(
    <th className={`px-4 py-2 font-medium ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <button onClick={() => onSort(field)} className="inline-flex items-center gap-1 hover:text-gray-700">
        {label}
        <span className="text-gray-400">{isActive ? (direction === 'asc' ? 'asc' : 'desc') : ''}</span>
      </button>
    </th>
  )
}

function TransactionRow({transaction,companiesById}:{transaction:BankTransaction;companiesById:Map<string,Company>}) {
  const matchedCompany =transaction.matched_company_id? companiesById.get(transaction.matched_company_id):undefined

  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="px-4 py-2 text-gray-600">{formatDate(transaction.entry_date)}</td>
      <td className="px-4 py-2 text-gray-900">{transaction.sender_name??'-'}</td>
      <td className="px-4 py-2 font-mono text-xs text-gray-500">{transaction.sender_inn ?? '-'}</td>
      <td className="px-4 py-2 text-right tabular-nums text-gray-900">{formatGEL(transaction.amount)}</td>
      <td className="px-4 py-2"><StatusBadge status={transaction.status as TransactionStatus}/></td>
      <td className="px-4 py-2 text-gray-600">{matchedCompany?.name ?? '-'}</td>
    </tr>
  )
}

function TransactionCard({transaction,companiesById}:{transaction:BankTransaction;companiesById:Map<string,Company>}) {
  const matchedCompany =transaction.matched_company_id? companiesById.get(transaction.matched_company_id):undefined
  return (
    <main className="flex flex-col gap-1.5 px-4 py-3">
      <section className="flex items-start justify-between gap-2">
        <span className="truncate text-sm font-medium text-gray-900">{transaction.sender_name ??'-'}</span>
        <StatusBadge status={transaction.status as TransactionStatus}/>
      </section>
      <section className="flex items-center justify-between text-xs text-gray-500">
        <span>{formatDate(transaction.entry_date)}</span>
        <span className="font-mono">{transaction.sender_inn??'-'}</span>
      </section>
      <section className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{matchedCompany?.name??'No match'}</span>
        <span className="text-sm font-semibold tabular-nums text-gray-900">{formatGEL(transaction.amount)}</span>
      </section>
    </main>
  )
}