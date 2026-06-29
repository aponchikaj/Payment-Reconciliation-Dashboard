'use client'
import {useQuery} from '@tanstack/react-query'
import {fetchCompanies} from '../services/companies';

export const companiesQueryKey=['companies'] as const

export function useCompanies(){
  return useQuery({queryKey:companiesQueryKey,queryFn:fetchCompanies})
}