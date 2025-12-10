"use client";

import { ActionIcon, InputLabel, Stack, UnstyledButton } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { MIME_TYPES } from "@repo/types";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { useThemeStore } from "../../store/zustand-zod-theme.store";
import NonSortableNavbarComponent from "../common/NonSortableListRow";

type Mode = "normal" | "announcement";

const LeftSideHeader = () => {
  const { selection, selectHeader } = useThemeStore();
  const [mode, setMode] = useState<Mode>("normal");
  const isSelected = selection?.type === "HEADER";

  return (
    <NonSortableNavbarComponent
      isSelected={isSelected}
      onClick={selectHeader}
      title="Header"
      defaultOpened={false}
    >
      <Stack gap={"xs"} p="xs" className="w-full" bg="white">
        <Dropzone
          onDrop={(files) => {
            console.log(files[0]);
          }}
          multiple={false}
          accept={[...MIME_TYPES["IMAGE"], ...MIME_TYPES["LOGO"]]}
        >
          <div className="flex flex-col gap-1">
            <InputLabel>Logo</InputLabel>
            <ActionIcon variant="outline" radius="0" size="80px">
              <IconPlus color="black" size={40} stroke={1} />
            </ActionIcon>
          </div>
        </Dropzone>
        <UnstyledButton fz={"sm"}>Duyuru Ekle</UnstyledButton>
      </Stack>
    </NonSortableNavbarComponent>
  );
};

export default LeftSideHeader;
