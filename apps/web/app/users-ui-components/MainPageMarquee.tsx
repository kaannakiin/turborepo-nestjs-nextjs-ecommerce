"use client";

import { Marquee } from "@gfazioli/mantine-marquee";
import { Text } from "@mantine/core";
import { MarqueeType } from "@repo/types";
interface MainPageMarqueeProps {
  data: MarqueeType;
}
const MainPageMarquee = ({ data }: MainPageMarqueeProps) => {
  return (
    <Marquee
      pauseOnHover={data.pauseOnHover}
      bg={data.backgroundColor}
      duration={data.duration}
      reverse={data.reverse}
    >
      {Array.from({ length: data.repeat }).map((_, index) => (
        <Text
          key={index}
          fz={data.fontSize}
          py={data.paddingY}
          className="text-nowrap"
          fw={data.fontWeight}
          c={data.textColor}
        >
          {data.text}
        </Text>
      ))}
    </Marquee>
  );
};

export default MainPageMarquee;
