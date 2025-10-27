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
import { createAIProxyFetch } from "@lib/aiFetchWrapper";
import { InputError, InputLabel, Stack } from "@mantine/core";
import { tr } from "../../lib/tr-dictionary";

const aiProxyUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai/chat`;

// const google = createGoogleGenerativeAI({
//   fetch: createAIProxyFetch(aiProxyUrl), // YENİSİ
//   apiKey: "fake-key", // Burası 'fake-key' olarak kalmalı
// });

// const model = google("gemini-2.5-pro-exp-03-25");
const model = createGroq({
  fetch: createAIProxyFetch(aiProxyUrl),
  apiKey: "fake-api-key",
})("llama-3.3-70b-versatile");
interface GlobalTextEditorProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  placeholder?: string;
}

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

const GlobalTextEditor = ({
  label,
  value,
  onChange,
  error,
  placeholder,
}: GlobalTextEditorProps) => {
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

  return (
    <Stack gap={"xs"}>
      <InputLabel fz={"sm"} fw={500}>
        {label || "Açıklama"}
      </InputLabel>
      {error && <InputError>{error}</InputError>}
      <BlockNoteView
        editor={editor}
        theme={"light"}
        formattingToolbar={false}
        slashMenu={false}
      >
        <AIMenuController />
        <FormattingToolbarWithAI />
        <SuggestionMenuWithAI editor={editor} />
      </BlockNoteView>
    </Stack>
  );
};

export default GlobalTextEditor;
