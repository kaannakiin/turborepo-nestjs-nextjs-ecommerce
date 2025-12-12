import { Control, useFieldArray } from "@repo/shared";
import { createComponent, ThemeComponents, ThemeInputType } from "@repo/types";
import { CreatebleSelectType } from "../../page";
import { useThemeStore } from "../../store/theme-store";
import ComponentLibrary from "./ComponentLibrary";

interface ComponentLibraryWrapperProps {
  control: Control<ThemeInputType>;
  pageIndex: number;
  createbleSelect: CreatebleSelectType[];
}

export const ComponentLibraryWrapper = ({
  control,
  pageIndex,
  createbleSelect,
}: ComponentLibraryWrapperProps) => {
  const { setSidebarView } = useThemeStore();

  const { append, fields } = useFieldArray({
    control,
    name: `pages.${pageIndex}.components`,
    keyName: "rhf_id",
  });

  const handleAddComponent = (type: ThemeComponents) => {
    const nextOrder = fields.length;
    const newComponent = createComponent(nextOrder, type);

    append(newComponent);

    setSidebarView("SECTIONS_LIST");
  };

  return (
    <ComponentLibrary items={createbleSelect} onSelect={handleAddComponent} />
  );
};
