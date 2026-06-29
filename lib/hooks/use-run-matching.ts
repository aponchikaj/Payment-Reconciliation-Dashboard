'use client';
import {useMutation, useQueryClient } from '@tanstack/react-query'
import {runMatching} from '../actions/run-matching'
import {transactionsQueryKey} from '../hooks/use-transactions'

export function useRunMatching(){
  const queryClient=useQueryClient()
  return useMutation({mutationFn:runMatching,onSuccess:()=>{queryClient.invalidateQueries({queryKey:transactionsQueryKey});}})
}