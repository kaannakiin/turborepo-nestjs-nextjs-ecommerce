'use client';

import {
  DesignComponentsSchemaInputType,
  DesignPageSchemaInputType,
  DesignSchemaInputType,
  DEFAULT_EMPTY_DESIGN,
} from '@repo/types';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface Selection {
  type: 'page' | 'component' | 'item';
  uniqueId: string;

  path: string[];
}

interface DesignStoreState {
  design: DesignSchemaInputType | null;
  originalDesign: DesignSchemaInputType | null;
  selection: Selection | null;
  activePageId: string | null;
  isDirty: boolean;
}

interface DesignStoreActions {
  setDesign: (design: DesignSchemaInputType) => void;
  resetDesign: () => void;

  select: (type: Selection['type'], uniqueId: string, path?: string[]) => void;
  clearSelection: () => void;

  findByUniqueId: <T = unknown>(uniqueId: string) => T | null;
  updateByUniqueId: <T extends Record<string, unknown>>(
    uniqueId: string,
    updater: Partial<T> | ((current: T) => T),
  ) => void;
  deleteByUniqueId: (uniqueId: string) => void;

  setActivePageId: (pageId: string | null) => void;
  addPage: (page: Omit<DesignPageSchemaInputType, 'components'>) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;

  addComponent: (
    pageUniqueId: string,
    component: DesignComponentsSchemaInputType,
    insertIndex?: number,
  ) => void;
  reorderComponents: (
    pageUniqueId: string,
    fromIndex: number,
    toIndex: number,
  ) => void;

  addItem: <T extends { uniqueId: string }>(
    parentUniqueId: string,
    arrayKey: string,
    item: T,
  ) => void;
  reorderItems: (
    parentUniqueId: string,
    arrayKey: string,
    fromIndex: number,
    toIndex: number,
  ) => void;

  markClean: () => void;
  resetToOriginal: () => void;
}

type DesignStore = DesignStoreState & DesignStoreActions;

function findRecursive(obj: unknown, targetId: string): unknown | null {
  if (!obj || typeof obj !== 'object') return null;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findRecursive(item, targetId);
      if (found) return found;
    }
    return null;
  }

  const record = obj as Record<string, unknown>;
  if (record.uniqueId === targetId) return obj;

  for (const value of Object.values(record)) {
    const found = findRecursive(value, targetId);
    if (found) return found;
  }

  return null;
}

function updateRecursive<T extends Record<string, unknown>>(
  obj: unknown,
  targetId: string,
  updater: Partial<T> | ((current: T) => T),
): boolean {
  if (!obj || typeof obj !== 'object') return false;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (updateRecursive(item, targetId, updater)) return true;
    }
    return false;
  }

  const record = obj as Record<string, unknown>;
  if (record.uniqueId === targetId) {
    if (typeof updater === 'function') {
      const updated = updater(record as T);
      Object.assign(record, updated);
    } else {
      Object.assign(record, updater);
    }
    return true;
  }

  for (const value of Object.values(record)) {
    if (updateRecursive(value, targetId, updater)) return true;
  }

  return false;
}

function deleteRecursive(obj: unknown, targetId: string): boolean {
  if (!obj || typeof obj !== 'object') return false;

  if (Array.isArray(obj)) {
    const index = obj.findIndex(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        (item as Record<string, unknown>).uniqueId === targetId,
    );
    if (index !== -1) {
      obj.splice(index, 1);
      return true;
    }
    for (const item of obj) {
      if (deleteRecursive(item, targetId)) return true;
    }
    return false;
  }

  const record = obj as Record<string, unknown>;
  for (const value of Object.values(record)) {
    if (deleteRecursive(value, targetId)) return true;
  }

  return false;
}

function reorderArray<T>(arr: T[], fromIndex: number, toIndex: number): void {
  const [removed] = arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, removed);
}

const initialDesign = DEFAULT_EMPTY_DESIGN;
const initialActivePageId = initialDesign.pages?.[0]?.uniqueId || null;

export const useDesignStore = create<DesignStore>()(
  immer((set, get) => ({
    design: initialDesign,
    originalDesign: initialDesign,
    selection: null,
    activePageId: initialActivePageId,
    isDirty: false,

    setDesign: (design) =>
      set((state) => {
        state.design = design;
        state.originalDesign = JSON.parse(JSON.stringify(design));
        state.isDirty = false;
        state.selection = null;
      }),

    resetDesign: () =>
      set((state) => {
        state.design = null;
        state.selection = null;
        state.isDirty = false;
      }),

    select: (type, uniqueId, path = []) =>
      set((state) => {
        state.selection = { type, uniqueId, path };
      }),

    clearSelection: () =>
      set((state) => {
        state.selection = null;
      }),

    setActivePageId: (pageId) =>
      set((state) => {
        state.activePageId = pageId;
        state.selection = null;
      }),

    findByUniqueId: <T = unknown>(uniqueId: string): T | null => {
      const { design } = get();
      if (!design) return null;
      return findRecursive(design, uniqueId) as T | null;
    },

    updateByUniqueId: (uniqueId, updater) =>
      set((state) => {
        if (!state.design) return;
        updateRecursive(state.design, uniqueId, updater);
        state.isDirty = true;
      }),

    deleteByUniqueId: (uniqueId) =>
      set((state) => {
        if (!state.design) return;
        deleteRecursive(state.design, uniqueId);

        if (state.selection?.uniqueId === uniqueId) {
          state.selection = null;
        }
        state.isDirty = true;
      }),

    addPage: (page) =>
      set((state) => {
        if (!state.design) return;
        if (!state.design.pages) {
          state.design.pages = [];
        }
        state.design.pages.push({
          ...page,
          components: [],
        });
        state.isDirty = true;
      }),

    reorderPages: (fromIndex, toIndex) =>
      set((state) => {
        if (!state.design?.pages) return;
        reorderArray(state.design.pages, fromIndex, toIndex);
        state.isDirty = true;
      }),

    addComponent: (pageUniqueId, component, insertIndex) =>
      set((state) => {
        if (!state.design?.pages) return;
        const page = state.design.pages.find(
          (p) => p.uniqueId === pageUniqueId,
        );
        if (page) {
          if (insertIndex !== undefined && insertIndex >= 0) {
            page.components.splice(insertIndex, 0, component);
          } else {
            page.components.push(component);
          }
          state.isDirty = true;
        }
      }),

    reorderComponents: (pageUniqueId, fromIndex, toIndex) =>
      set((state) => {
        if (!state.design?.pages) return;
        const page = state.design.pages.find(
          (p) => p.uniqueId === pageUniqueId,
        );
        if (page) {
          reorderArray(page.components, fromIndex, toIndex);
          state.isDirty = true;
        }
      }),

    addItem: (parentUniqueId, arrayKey, item) =>
      set((state) => {
        if (!state.design) return;
        const parent = findRecursive(state.design, parentUniqueId) as Record<
          string,
          unknown
        > | null;
        if (parent && Array.isArray(parent[arrayKey])) {
          (parent[arrayKey] as unknown[]).push(item);
          state.isDirty = true;
        }
      }),

    reorderItems: (parentUniqueId, arrayKey, fromIndex, toIndex) =>
      set((state) => {
        if (!state.design) return;
        const parent = findRecursive(state.design, parentUniqueId) as Record<
          string,
          unknown
        > | null;
        if (parent && Array.isArray(parent[arrayKey])) {
          const arr = parent[arrayKey] as unknown[];
          reorderArray(arr, fromIndex, toIndex);

          arr.forEach((item, index) => {
            if (
              item &&
              typeof item === 'object' &&
              'order' in item &&
              typeof (item as { order: number }).order === 'number'
            ) {
              (item as { order: number }).order = index;
            }
          });

          state.isDirty = true;
        }
      }),

    markClean: () =>
      set((state) => {
        state.isDirty = false;
      }),

    resetToOriginal: () =>
      set((state) => {
        if (state.originalDesign) {
          state.design = JSON.parse(JSON.stringify(state.originalDesign));
          state.isDirty = false;
          state.selection = null;
        }
      }),
  })),
);

export const useSelectedItem = () => {
  const selection = useDesignStore((s) => s.selection);
  const findByUniqueId = useDesignStore((s) => s.findByUniqueId);

  if (!selection) return null;
  return findByUniqueId(selection.uniqueId);
};

export const useIsSelected = (uniqueId: string) => {
  return useDesignStore((s) => s.selection?.uniqueId === uniqueId);
};
