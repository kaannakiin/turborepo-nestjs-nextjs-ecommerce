import { useEffect, useRef } from 'react';

export const useBlobUrl = (file: File | null | undefined): string | null => {
  const urlRef = useRef<string | null>(null);
  const fileRef = useRef<File | null>(null);

  if (file !== fileRef.current) {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
    }

    urlRef.current = file ? URL.createObjectURL(file) : null;
    fileRef.current = file || null;
  }

  useEffect(() => {
    return () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
      }
    };
  }, []);

  return urlRef.current;
};
