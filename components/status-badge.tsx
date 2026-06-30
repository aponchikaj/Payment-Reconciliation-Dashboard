import type {TransactionStatus} from '../types/database';

const STATUS_STYLES:Record<TransactionStatus,string>={
  matched:'bg-green-50 text-green-700 ring-green-600/20',
  unmatched:'bg-red-50 text-red-700 ring-red-600/20',
  ignored:'bg-black-100 text-black-600 ring-black-500/20'
}
const STATUS_LABELS:Record<TransactionStatus,string> ={
  matched:'Matched',
  unmatched:'Unmatched',
  ignored:'Ignored'
}

export function StatusBadge({status}:{status:TransactionStatus}){
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}>{STATUS_LABELS[status]}</span>
  )
}