import { useState } from "react";

export const usePagination = (pageSize = 10) => {
  const [page, setPage] = useState(1);
  const paginate = <T>(items: T[]) => items.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = (total: number) => Math.ceil(total / pageSize);
  return { page, setPage, paginate, totalPages };
};
