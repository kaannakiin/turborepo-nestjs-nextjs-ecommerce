"use client";

import { HeaderOutputType } from "@repo/types";
import { Activity } from "react";
import FirstThemeAnouncement from "./FirstThemeAnouncement";

interface FirstThemeHeaderProps {
  data: HeaderOutputType;
}

const FirstThemeHeader = ({ data }: FirstThemeHeaderProps) => {
  const anouncement = data?.announcements;
  return (
    <>
      <Activity mode={anouncement?.length > 0 ? "visible" : "hidden"}>
        <FirstThemeAnouncement data={anouncement} />
      </Activity>
      <div className="flex w-full h-16 flex-col"></div>
    </>
  );
};

export default FirstThemeHeader;
