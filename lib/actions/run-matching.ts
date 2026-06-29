'use server'
import {createClient} from '@/lib/supabase/server';
import type {BankTransaction,Company} from'../../types/database'

export interface MatchingResult {
  matchedCount:number
  totalUnmatchedBefore:number
  stillUnmatchedCount:number
}

function normalizeTaxId(value:string|null):string|null{
  if (!value)return null
  const trimmed=value.trim()
  return trimmed.length> 0?trimmed:null
}

export async function runMatching():Promise<MatchingResult> {
  const supabase =await createClient()

  const [{data:transactions,error:txError},{data:companies,error:companyError}] =await Promise.all([supabase.from('bank_transactions').select('*').eq('status','unmatched'),supabase.from('companies').select('*')])

  if(txError)throw new Error(`Failed to fetch transactions: ${txError.message}`)
  if(companyError) throw new Error(`Failed to fetch companies: ${companyError.message}`)

  const unmatchedTransactions:BankTransaction[] =transactions??[]
  const allCompanies:Company[] =companies??[]

  const companyByTaxId = new Map<string,Company>()
  for(const company of allCompanies){
    const normalized=normalizeTaxId(company.tax_id);
    if(normalized)companyByTaxId.set(normalized,company)
  }

  const matchedIds:string[] =[];
  const matchedCompanyIdByTxId=new Map<string,string>()

  for(const tx of unmatchedTransactions) {
    const normalizedInn=normalizeTaxId(tx.sender_inn)
    if(!normalizedInn) continue;

    const company=companyByTaxId.get(normalizedInn)
    if(company){
      matchedIds.push(tx.id)
      matchedCompanyIdByTxId.set(tx.id,company.id)
    }
  }

  const idsByCompany=new Map<string,string[]>()
  for (const [txId,companyId] of matchedCompanyIdByTxId.entries()) {
    const list=idsByCompany.get(companyId)??[]
    list.push(txId);
    idsByCompany.set(companyId,list)
  }

  for (const [companyId, txIds] of idsByCompany.entries()) {
    const { error: updateError } = await supabase
      .from('bank_transactions')
      .update({
        matched_company_id: companyId,
        match_method: 'inn_exact' as const,
        match_confidence: 1,
        status: 'matched' as const,
      })
      .in('id', txIds);

    if (updateError) {
      throw new Error(`Failed to update matched transactions for company ${companyId}: ${updateError.message}`);
    }
  }
  return{matchedCount:matchedIds.length,totalUnmatchedBefore:unmatchedTransactions.length,stillUnmatchedCount:unmatchedTransactions.length-matchedIds.length};
}