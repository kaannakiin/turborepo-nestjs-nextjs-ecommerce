export interface DesignPreviewProps<T = unknown> {
  data: T;
  isSelected?: boolean;
  onSelect?: () => void;
}

export interface DesignItemPreviewProps<T = unknown> {
  data: T;
  index: number;
  isSelected?: boolean;
  onSelect?: () => void;
}
