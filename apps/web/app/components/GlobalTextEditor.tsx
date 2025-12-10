"use client";
import { createGroq } from "@ai-sdk/groq";
import { BlockNoteEditor, filterSuggestionItems } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import {
  FormattingToolbar,
  FormattingToolbarController,
  getDefaultReactSlashMenuItems,
  getFormattingToolbarItems,
  SuggestionMenuController,
  useCreateBlockNote,
} from "@blocknote/react";
import {
  AIMenuController,
  AIToolbarButton,
  ClientSideTransport,
  createAIExtension,
  getAISlashMenuItems,
} from "@blocknote/xl-ai";
import { createAIProxyFetch } from "@lib/wrappers/aiFetchWrapper";
import { InputError, InputLabel, Stack } from "@mantine/core";
import { useEffect, useRef } from "react";
import { tr } from "../../lib/tr-dictionary";

const aiProxyUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai/chat`;

const model = createGroq({
  fetch: createAIProxyFetch(aiProxyUrl),
  apiKey: "fake-api-key",
})("qwen/qwen3-32b");
interface GlobalTextEditorProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  placeholder?: string;
  renderLabel?: boolean;
}

// ... FormattingToolbarWithAI ve SuggestionMenuWithAI (değişiklik yok) ...
function FormattingToolbarWithAI() {
  return (
    <FormattingToolbarController
      formattingToolbar={() => (
        <FormattingToolbar>
          {...getFormattingToolbarItems()}
          <AIToolbarButton />
        </FormattingToolbar>
      )}
    />
  );
}

function SuggestionMenuWithAI(props: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor: BlockNoteEditor<any, any, any>;
}) {
  return (
    <SuggestionMenuController
      triggerCharacter="/"
      getItems={async (query) =>
        filterSuggestionItems(
          [
            ...getDefaultReactSlashMenuItems(props.editor),
            ...getAISlashMenuItems(props.editor),
          ],
          query
        )
      }
    />
  );
}
// ...

const GlobalTextEditor = ({
  label,
  value,
  onChange,
  error,
  placeholder,
  renderLabel = true,
}: GlobalTextEditorProps) => {
  const onChangeRef = useRef(onChange);

  const editor = useCreateBlockNote({
    dictionary: {
      ...tr,
      ...(placeholder
        ? {
            placeholders: {
              ...tr.placeholders,
              emptyDocument: placeholder,
              default: placeholder,
              heading: placeholder,
            },
          }
        : {}),
    },
    initialContent: [
      {
        type: "paragraph",
        content: "",
      },
    ],
    extensions: [
      createAIExtension({
        transport: new ClientSideTransport({
          model: model,
        }),
      }),
    ],
  });

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    if (value !== undefined) {
      const currentHTML = editor.blocksToHTMLLossy(editor.document);

      if (value !== currentHTML) {
        const blocks = editor.tryParseHTMLToBlocks(value);

        editor.replaceBlocks(editor.document, blocks);
      }
    }
  }, [value, editor]);

  const onBlockNoteChange = () => {
    const html = editor.blocksToHTMLLossy(editor.document);
    onChangeRef.current?.(html);
  };

  return (
    <Stack gap={"xs"}>
      {renderLabel && (
        <InputLabel fz={"sm"} fw={500}>
          {label || "Açıklama"}
        </InputLabel>
      )}
      {error && <InputError>{error}</InputError>}
      <BlockNoteView
        editor={editor}
        theme={"light"}
        formattingToolbar={false}
        slashMenu={false}
        onChange={onBlockNoteChange}
      >
        <AIMenuController />
        <FormattingToolbarWithAI />
        <SuggestionMenuWithAI editor={editor} />
      </BlockNoteView>
    </Stack>
  );
};

export default GlobalTextEditor;
