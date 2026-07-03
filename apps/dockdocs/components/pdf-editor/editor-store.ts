// Editor state + undo/redo as a pure reducer (drive with useReducer).
//
// History model: past/future hold element-array snapshots. A pointer gesture
// (drag / resize) streams many updates per second — those go through
// `transient: true`, which mutates `present` without touching history; the
// gesture's pointerdown dispatches `snapshot` ONCE so undo rewinds the whole
// gesture, not each mouse move.

import type { EditorElement } from "./editor-types";

const HISTORY_LIMIT = 100;

export type EditorState = {
  elements: EditorElement[];
  selectedId: string | null;
  /** id of the element currently in inline text-edit mode. */
  editingId: string | null;
  past: EditorElement[][];
  future: EditorElement[][];
};

export const initialEditorState: EditorState = {
  elements: [],
  selectedId: null,
  editingId: null,
  past: [],
  future: [],
};

export type EditorAction =
  | { type: "add"; el: EditorElement }
  | { type: "update"; id: string; patch: Partial<EditorElement>; transient?: boolean }
  | { type: "remove"; id: string }
  | { type: "select"; id: string | null }
  | { type: "edit"; id: string | null }
  /** Push the current elements onto history — call once at gesture start. */
  | { type: "snapshot" }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset" };

function pushPast(state: EditorState): Pick<EditorState, "past" | "future"> {
  // A double-click fires two pointerdown snapshots with no change in between —
  // dedup by reference so undo steps always represent real edits.
  if (state.past[state.past.length - 1] === state.elements)
    return { past: state.past, future: [] };
  const past = [...state.past, state.elements];
  if (past.length > HISTORY_LIMIT) past.shift();
  return { past, future: [] };
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "add": {
      // z is assigned HERE, against current state — callers may hold stale
      // closures (e.g. two concurrent image loads), so caller-supplied z is
      // advisory only.
      const el = { ...action.el, z: nextZ(state.elements) } as EditorElement;
      return {
        ...state,
        ...pushPast(state),
        elements: [...state.elements, el],
        selectedId: el.id,
        editingId: null,
      };
    }
    case "update": {
      const elements = state.elements.map((el) =>
        el.id === action.id ? ({ ...el, ...action.patch } as EditorElement) : el,
      );
      return action.transient
        ? { ...state, elements }
        : { ...state, ...pushPast(state), elements };
    }
    case "remove":
      return {
        ...state,
        ...pushPast(state),
        elements: state.elements.filter((el) => el.id !== action.id),
        selectedId: state.selectedId === action.id ? null : state.selectedId,
        editingId: state.editingId === action.id ? null : state.editingId,
      };
    case "select":
      return state.selectedId === action.id && state.editingId === null
        ? state
        : { ...state, selectedId: action.id, editingId: null };
    case "edit":
      return { ...state, editingId: action.id, selectedId: action.id ?? state.selectedId };
    case "snapshot":
      return { ...state, ...pushPast(state) };
    case "undo": {
      const prev = state.past[state.past.length - 1];
      if (!prev) return state;
      return {
        ...state,
        elements: prev,
        past: state.past.slice(0, -1),
        future: [state.elements, ...state.future],
        selectedId: null,
        editingId: null,
      };
    }
    case "redo": {
      const next = state.future[0];
      if (!next) return state;
      return {
        ...state,
        elements: next,
        past: [...state.past, state.elements],
        future: state.future.slice(1),
        selectedId: null,
        editingId: null,
      };
    }
    case "reset":
      return initialEditorState;
    default:
      return state;
  }
}

export const nextZ = (elements: EditorElement[]) =>
  elements.reduce((m, el) => Math.max(m, el.z), 0) + 1;
