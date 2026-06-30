import { z } from 'zod';

export const statusFilterSchema=z.enum(['all','matched','unmatched','ignored']).catch('all')

export type StatusFilter = z.infer<typeof statusFilterSchema>

export const sortFieldSchema = z.enum(['entry_date','amount']).catch('entry_date')
export const sortDirectionSchema =z.enum(['asc','desc']).catch('desc');

export type SortField= z.infer<typeof sortFieldSchema>
export type SortDirection= z.infer<typeof sortDirectionSchema>

export const monthKeySchema=z.string().regex(/^\d{4}-\d{2}-01$/,'Expected a YYYY-MM-01 month key').catch('2026-04-01')

export type MonthKey = z.infer<typeof monthKeySchema>;

export const dashboardFiltersSchema=z.object({
    month:monthKeySchema,
    status:statusFilterSchema,
    sortField:sortFieldSchema,
    sortDirection:sortDirectionSchema,
    search:z.string().trim().max(200,'Search term is too long').catch('')
})

export type DashboardFilters = z.infer<typeof dashboardFiltersSchema>;

export const defaultDashboardFilters:DashboardFilters = {
  month: '2026-04-01',
  status: 'all',
  sortField: 'entry_date',
  sortDirection: 'desc',
  search: '',
}

export function parseDashboardFilters(params:URLSearchParams|Record<string,string|null|undefined>):DashboardFilters{
  const get=(key:string):string|undefined=>{
    if (params instanceof URLSearchParams){
      return params.get(key)?? undefined
    }
    return params[key]??undefined
  }

  return dashboardFiltersSchema.parse({month:get('month')??defaultDashboardFilters.month,status:get('status')??defaultDashboardFilters.status,sortField:get('sortField')??defaultDashboardFilters.sortField,sortDirection:get('sortDirection')??defaultDashboardFilters.sortDirection,search:get('search')??defaultDashboardFilters.search})
}