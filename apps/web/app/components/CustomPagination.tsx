"use client";

import { Flex, Pagination, PaginationProps } from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface CustomPaginationProps extends PaginationProps {
  paginationKey?: string;
}

const CustomPagination = ({
  paginationKey = "page",
  ...props
}: CustomPaginationProps) => {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const [page, setPage] = useState<number>(
    searchParams.get(paginationKey)
      ? parseInt(searchParams.get(paginationKey)!)
      : 1
  );

  return (
    <Flex justify="center" align="center">
      <Pagination
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

export default CustomPagination;
