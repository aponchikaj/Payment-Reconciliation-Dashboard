export type ContractStatus = 'active'|'paused'|'ended'
export type TransactionStatus='matched'|'unmatched'|'ignored'
export type MatchMethod ='inn_exact'|'manual'

export interface Company{
  id:string
  name:string
  tax_id:string
  created_at:string
}

export interface Contract{
  id:string;
  company_id:string
  monthly_amount:number;
  status:ContractStatus;
  start_date: string
  end_date: string|null
  created_at: string
}

export interface BankTransaction{
  id:string
  doc_key:string;
  entry_date:string
  amount:number
  currency:string
  sender_name: string|null
  sender_inn:string |null
  sender_account: string|null;
  purpose:string|null
  matched_company_id:string|null
  match_method: MatchMethod|null
  match_confidence:number|null
  status:TransactionStatus
  created_at:string
  updated_at:string
}

export interface Database {
  public:{
    Tables:{
      companies:{
        Row:{[K in keyof Company]:Company[K]}
        Insert:Omit<Company,'id'|'created_at'>&{id?:string;created_at?:string}
        Update:Partial<Omit<Company,'id'>>
        Relationships:[]
      }
      contracts:{
        Row:{[K in keyof Contract]:Contract[K]}
        Insert:Omit<Contract,'id'|'created_at'>&{id?:string;created_at?:string}
        Update:Partial<Omit<Contract,'id'>>
        Relationships: []
      }
      bank_transactions: {
        Row: { [K in keyof BankTransaction]: BankTransaction[K] }
        Insert:Omit<BankTransaction,'id'|'created_at'|'updated_at'>& {
          id?:string
          created_at?:string
          updated_at?:string;
        };
        Update:Partial<Omit<BankTransaction,'id'>>;
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}