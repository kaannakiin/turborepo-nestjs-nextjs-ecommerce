"use client";

import { AnnouncementOutputType } from "@repo/types";
import { Route } from "next";
import Link from "next/link";
import "swiper/css";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

interface FirstThemeAnouncementProps {
  data: AnnouncementOutputType[];
}

const FirstThemeAnouncement = ({ data }: FirstThemeAnouncementProps) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full relative z-50">
      <Swiper
        modules={[Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        loop={data.length > 1}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        className="h-10"
      >
        {data.map((item, index) => (
          <SwiperSlide key={`${index}-${item.text}`}>
            <div
              style={{
                backgroundColor: item.backgroundColor,
                color: item.textColor,
              }}
              className="w-full h-full flex items-center justify-center py-2 px-4 text-base font-semibold text-center transition-colors"
            >
              {item.url ? (
                <Link
                  href={item.url as Route}
                  className="hover:underline flex items-center justify-center w-full h-full"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  {item.text}
                </Link>
              ) : (
                <span>{item.text}</span>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default FirstThemeAnouncement;
