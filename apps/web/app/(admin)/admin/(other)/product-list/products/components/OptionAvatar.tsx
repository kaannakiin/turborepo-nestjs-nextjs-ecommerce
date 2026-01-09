import { useBlobUrl } from '@hooks/useBlobUrl';
import { Avatar } from '@mantine/core';

interface OptionAvatarProps {
  file: File;
  size?: number;
  radius?: number;
}

const OptionAvatar = ({ file, size = 20, radius = 4 }: OptionAvatarProps) => {
  const url = useBlobUrl(file);

  if (!url) return null;

  return <Avatar src={url} radius={radius} size={size} />;
};

export default OptionAvatar;
