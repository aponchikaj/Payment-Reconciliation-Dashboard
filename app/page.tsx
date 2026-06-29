import { createClient } from '../lib/supabase/server';

//satestod
export default async function Home() {
  const supabase= await createClient()
  const {data,error}=await supabase.from('bank_transactions').select('*');
  return<section>{JSON.stringify({data,error},null,2)}</section>
}