import type {BankTransaction} from '../types/database'

interface StatsBarProps{
  transactions:BankTransaction[]
}

function formatGEL(amount:number):string{
  return new Intl.NumberFormat('en-US',{style:'currency',currency:'GEL',maximumFractionDigits:2}).format(amount);
}

export function StatsBar({transactions}:StatsBarProps){
  const total=transactions.length
  const totalAmount= transactions.reduce((sum,t)=>sum+ t.amount,0)

  const matched = transactions.filter((t)=>t.status=='matched');
  const matchedAmount=matched.reduce((sum,t) =>sum+t.amount,0)

  const unmatched =transactions.filter((t)=>t.status=='unmatched')
  const unmatchedAmount= unmatched.reduce((sum,t) =>sum+t.amount,0)

  const matchRate=total > 0 ? Math.round((matched.length/total)*100):0
  return(
    <section aria-label="Transaction statistics" className="grid grid-cols-1  gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total transactions"value={String(total)} sublabel={formatGEL(totalAmount)}/>
      <StatCard label="Matched" value={String(matched.length)}sublabel={formatGEL(matchedAmount)} tone="green"/>
      <StatCard label="Unmatched" value={String(unmatched.length)} sublabel={formatGEL(unmatchedAmount)} tone="red"/>
      <StatCard label="Match rate" value={`${matchRate}%`} sublabel="of this month's volume"/>
    </section>
  )
}

interface StatCardProps{
  label:string
  value:string;
  sublabel:string
  tone?:'green'|'red'|'neutral'
}

function StatCard({label,value,sublabel,tone='neutral'}:StatCardProps) {
  const valueColor =tone=='green'?'text-green-600' :tone == 'red'?'text-red-600':'text-gray-900'
  return(
    <main className="min-w-0 rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${valueColor}`}>{value}</p>
      <p className="mt-0.5 text-xs text-gray-500">{sublabel}</p>
    </main>
  )
}