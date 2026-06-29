import {createClient} from '../supabase/client';
import type {Contract} from '../../types/database';

export async function fetchContracts(): Promise<Contract[]> {
  const supabase = createClient();
  const {data,error} =await supabase.from('contracts').select('*').order('start_date',{ascending:true})

  if(error) throw new Error(`Failed to fetch contracts:${error.message}`)

  return data;
}