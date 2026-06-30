import type {ExpectedVsActualRow} from '../lib/utils/expected-vs-actual'

interface ExpectedVsActualProps{
    rows: ExpectedVsActualRow[]
}

function formatGEL(amount: number):string{
    return new Intl.NumberFormat('en-US',{
        style:'currency',
        currency:'GEL',
        maximumFractionDigits:2
    }).format(amount)
}

const TONE_STYLES ={
    paid:'text-green-600',
    underpaid:'text-red-600',
    'no-payment':'text-gray-400'
}as const

const TONE_LABELS={
  paid:'Paid in full',
  underpaid:'Underpaid',
  'no-payment':'No payment'
} as const

export function ExpectedVsActual({rows}:ExpectedVsActualProps){
  return(
    <main className="mx-auto w-full max-w-6xl rounded-lg border border-gray-200 bg-white">
      <section className="border-b border-gray-200 p-3 sm:p-4">
        <h2 className="text-sm font-semibold text-gray-900">Expected vs Actual</h2>
        <p className="mt-0.5 text-xs text-gray-500">Contract amounts owed this month, compared to matched payments received.</p>
      </section>
      {rows.length ==0?(<p className="px-4 py-8 text-center text-gray-400">No companies had an active contract or payment this month.</p>):(
        <>
        <section className="hidden sm:block">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                        <th className="px-4 py-2 font-medium">Company</th>
                        <th className="px-4 py-2 text-right font-medium">Expected</th>
                        <th className="px-4 py-2 text-right font-medium">Actual</th>
                        <th className="px-4 py-2 text-right font-medium">Difference</th>
                        <th className="px-4 py-2 font-medium">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row)=>(
                        <tr key={row.companyId} className="border-b border-gray-100 last:border-0">
                            <td className="px-4 py-2 text-gray-900">{row.companyName}</td>
                            <td className="px-4 py-2 text-right tabular-nums text-gray-600">{formatGEL(row.expectedAmount)}</td>
                            <td className="px-4 py-2 text-right tabular-nums text-gray-900">{formatGEL(row.actualAmount)}</td>
                            <td className={`px-4 py-2 text-right tabular-nums font-medium ${TONE_STYLES[row.tone]}`}>{row.difference > 0 ? '+' : ''} {formatGEL(row.difference)}</td>
                            <td className={`px-4 py-2 text-xs font-medium ${TONE_STYLES[row.tone]}`}>{TONE_LABELS[row.tone]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>

          <section className="divide-y divide-gray-100 sm:hidden">
            {rows.map((row) => (
              <section key={row.companyId} className="flex flex-col gap-1.5 px-4 py-3">
                <section className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-gray-900">{row.companyName}</span>
                  <span className={`text-xs font-medium ${TONE_STYLES[row.tone]}`}>{TONE_LABELS[row.tone]}</span>
                </section>
                <section className="flex items-center justify-between text-xs text-gray-500">
                  <span>Expected: {formatGEL(row.expectedAmount)}</span>
                  <span>Actual: {formatGEL(row.actualAmount)}</span>
                </section>
                <section className={`text-right text-sm font-semibold tabular-nums ${TONE_STYLES[row.tone]}`}>{row.difference > 0 ? '+' : ''}{formatGEL(row.difference)}</section>
              </section>
            ))}
          </section>
        </>
      )}
    </main>
  )
}