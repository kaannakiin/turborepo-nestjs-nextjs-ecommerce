import { Skeleton } from '@mantine/core';

export const CartLoadingSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <Skeleton height={24} width={120} />
        <Skeleton height={20} width={80} />
      </div>

      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3">
          <Skeleton height={80} width={80} />

          <div className="flex-1 flex flex-col gap-2">
            <Skeleton height={16} width="70%" />
            <Skeleton height={14} width="50%" />
            <div className="flex gap-2 mt-auto">
              <Skeleton height={32} width={100} />
              <Skeleton height={20} width={60} />
            </div>
          </div>
        </div>
      ))}

      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between mb-2">
          <Skeleton height={16} width={100} />
          <Skeleton height={16} width={80} />
        </div>
        <Skeleton height={48} width="100%" mt="md" />
      </div>
    </div>
  );
};
