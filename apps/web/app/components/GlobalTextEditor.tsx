"use client";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { InputLabel, Stack } from "@mantine/core";
import { tr } from "../../lib/tr-dictionary";
import { useEffect } from "react";

interface GlobalTextEditorProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
}

const GlobalTextEditor = ({
  label,
  value,
  onChange,
  error,
}: GlobalTextEditorProps) => {
  const editor = useCreateBlockNote({
    dictionary: tr,
    initialContent: null,
  });

  const handleChange = async () => {
    if (onChange) {
      const htmlContent = await editor.blocksToHTMLLossy(editor.document);
      onChange(htmlContent);
    }
  };

  // Value değiştiğinde HTML'i BlockNote formatına çevir
  useEffect(() => {
    if (value && editor) {
      async function loadHTML() {
        const blocks = await editor.tryParseHTMLToBlocks(value!);
        editor.replaceBlocks(editor.document, blocks);
      }
      loadHTML();
    }
  }, [value, editor]);

  // Mount olduğunda ilk dönüşümü tetikle
  useEffect(() => {
    if (onChange) {
      handleChange();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stack gap={"xs"}>
      <InputLabel fz={"sm"} fw={500}>
        {label || "Açıklama"}
      </InputLabel>
      <BlockNoteView
        editor={editor}
        theme={"light"}
        onChange={handleChange}
        data-error={error ? true : undefined}
        style={{
          border: error ? "1px solid var(--mantine-color-error)" : undefined,
          borderRadius: "var(--mantine-radius-sm)",
          minHeight: "150px",
        }}
      />
      {error && (
        <div
          style={{
            color: "var(--mantine-color-error)",
            fontSize: "var(--mantine-font-size-xs)",
          }}
        >
          {error}
        </div>
      )}
    </Stack>
  );
};

export default GlobalTextEditor;
