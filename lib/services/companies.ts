import {createClient} from '../supabase/client';
import type {Company} from '../../types/database';

export async function fetchCompanies():Promise<Company[]>{
  const supabase=createClient()
  const {data,error}= await supabase.from('companies').select('*').order('name',{ascending:true});

  if(error) throw new Error(`Failed to fetch companies:${error.message}`)

  return data;
}