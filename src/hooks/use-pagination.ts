import { useState } from "react";

import { useDebounce } from "@/hooks/use-debounce.ts";

const DEFAULT_PAGE_SIZE = 10;

function usePagination(pageSize: number = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(pageSize);
  const debouncedPage = useDebounce(page);

  const handleNextClick = () => {
    setPage((prev) => prev + 1);
  };

  const handlePreviousClick = () => {
    setPage((prev) => prev - 1);
  };

  const resetPageCount = () => {
    setPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setSize(size);
    resetPageCount();
  };

  return {
    page: page,
    size,
    setPage,
    debouncedPage: debouncedPage,
    handleNextClick,
    handlePreviousClick,
    handlePageSizeChange,
  };
}

export default usePagination;
