import { Text, TextProps, Tooltip } from "@mantine/core";
import { useRef, useState } from "react";

interface TruncatedTextProps extends TextProps {
  children: string;
}

export const TruncatedText = ({ children, ...props }: TruncatedTextProps) => {
  const [isTruncated, setIsTruncated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const checkTruncation = () => {
    const el = ref.current;
    if (el) {
      setIsTruncated(el.scrollWidth > el.clientWidth);
    }
  };

  return (
    <Tooltip
      label={children}
      disabled={!isTruncated}
      withArrow
      multiline
      w={220}
    >
      <Text ref={ref} truncate="end" onMouseEnter={checkTruncation} {...props}>
        {children}
      </Text>
    </Tooltip>
  );
};
