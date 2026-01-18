'use client';

import {
  Flex,
  Pagination as MantinePagination,
  PaginationProps as MantinePaginationProps,
} from '@mantine/core';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface PaginationProps extends MantinePaginationProps {
  paginationKey?: string;
}

const Pagination = ({ paginationKey = 'page', ...props }: PaginationProps) => {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const [page, setPage] = useState<number>(
    searchParams.get(paginationKey)
      ? parseInt(searchParams.get(paginationKey)!)
      : 1,
  );

  return (
    <Flex justify="center" align="center">
      <MantinePagination
        onChange={(value) => {
          setPage(value);
          const params = new URLSearchParams(searchParams.toString());
          params.set(paginationKey, value.toString());
          replace(`?${params.toString()}`);
        }}
        value={page}
        {...props}
      />
    </Flex>
  );
};

export default Pagination;
