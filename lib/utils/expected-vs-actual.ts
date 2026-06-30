import type {Company,Contract,BankTransaction } from '../../types/database';
import type { MonthKey} from'../schemas/dashboard-filters'
import {contractOverlapsMonth,isInMonth} from '../utils/months'

export type ExpectedVsActualTone ='paid'|'underpaid'|'no-payment'

export interface ExpectedVsActualRow{
  companyId:string
  companyName:string
  expectedAmount:number;
  actualAmount:number
  difference:number
  tone:ExpectedVsActualTone
}

export function computeExpectedVsActual(companies:Company[],contracts:Contract[],transactions:BankTransaction[],month:MonthKey):ExpectedVsActualRow[]{
  const expectedByCompany=new Map<string,number>()
  for (const contract of contracts){
    if(!contractOverlapsMonth(contract,month))continue
    const current =expectedByCompany.get(contract.company_id)??0
    expectedByCompany.set(contract.company_id,current +contract.monthly_amount)
  }

  const actualByCompany = new Map<string,number>()
  for(const tx of transactions){
    if(tx.status !='matched')continue
    if(!tx.matched_company_id) continue
    if(!isInMonth(tx.entry_date, month)) continue
    const current=actualByCompany.get(tx.matched_company_id) ??0
    actualByCompany.set(tx.matched_company_id,current + tx.amount)
  }

  const relevantCompanyIds=new Set<string>([...expectedByCompany.keys(),...actualByCompany.keys()])

  const rows:ExpectedVsActualRow[]=[]
  for(const companyId of relevantCompanyIds){
    const company =companies.find((c)=>c.id ==companyId)
    if (!company) continue
    const expectedAmount= expectedByCompany.get(companyId)??0
    const actualAmount =actualByCompany.get(companyId)?? 0
    const difference=actualAmount-expectedAmount

    let tone:ExpectedVsActualTone;
    if (actualAmount==0) {
      tone ='no-payment'
    }else if(actualAmount>=expectedAmount){
      tone='paid'
    }else{
        tone ='underpaid'
    }
    rows.push({companyId,companyName:company.name,expectedAmount,actualAmount,difference,tone})
  }
  rows.sort((a,b)=>a.companyName.localeCompare(b.companyName,'ka'))
  return rows;
}