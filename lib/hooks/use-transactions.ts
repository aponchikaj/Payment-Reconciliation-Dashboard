'use client'
import {useQuery} from '@tanstack/react-query';
import {fetchTransactions} from '../services/transactions';

export const transactionsQueryKey=['transactions'] as const;

export function useTransactions(){
  return useQuery({queryKey:transactionsQueryKey,queryFn:fetchTransactions})
}