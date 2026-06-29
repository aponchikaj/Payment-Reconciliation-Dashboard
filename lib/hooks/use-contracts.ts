'use client'
import {useQuery} from '@tanstack/react-query'
import {fetchContracts} from '../services/contracts'

export const contractsQueryKey=['contracts'] as const

export function useContracts(){
  return useQuery({queryKey:contractsQueryKey,queryFn:fetchContracts})
}