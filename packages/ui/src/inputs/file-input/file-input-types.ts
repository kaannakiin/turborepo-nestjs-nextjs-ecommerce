import { AssetType } from "@repo/database/client";

export interface Asset {
  url: string;
  type: AssetType;
}

export interface FileItem {
  id: string;
  file: File;
  url: string;
  isExisting: boolean;
  type: AssetType;
  originalUrl?: string;
}

export interface FileItemProps {
  item: FileItem;
  onRemove: () => void;
  onPreview: () => void;
  showDragHandle?: boolean;
}

export interface FileListProps {
  items: FileItem[];
  onRemove: (item: FileItem) => void;
  onPreview: (item: FileItem) => void;
}

export interface SortableFileListProps extends FileListProps {
  onOrderChange?: (items: FileItem[]) => void;
}
