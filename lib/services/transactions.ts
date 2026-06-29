import {createClient} from '../supabase/client';
import type {BankTransaction} from '../../types/database';

export async function fetchTransactions():Promise<BankTransaction[]>{
  const supabase =createClient()
  const {data,error} = await supabase.from('bank_transactions').select('*').order('entry_date',{ascending:false})

  if(error) throw new Error(`Failed to fetch transactions: ${error.message}`);

  return data;
}