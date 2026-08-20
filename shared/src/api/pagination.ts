export interface PageRequest {
  page: number;
  pageSize: number;
}

export interface PageMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PageMeta;
}
