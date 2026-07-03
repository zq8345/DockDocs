// Editor state + undo/redo as a pure reducer (drive with useReducer).
//
// History model: past/future hold {elements, pageList} snapshots — page
// management (insert/delete/rotate/reorder) is undoable exactly like element
// edits. A pointer gesture (drag / resize) streams many updates per second —
// those go through `transient: true`, which mutates `present` without
// touching history; the gesture's pointerdown dispatches `snapshot` ONCE so
// undo rewinds the whole gesture, not each mouse move.

import { rotateRectCW, type EditorElement, type PageRef } from "./editor-types";

const HISTORY_LIMIT = 100;

type Snapshot = { elements: EditorElement[]; pageList: PageRef[] };

export type EditorState = {
  elements: EditorElement[];
  pageList: PageRef[];
  selectedId: string | null;
  /** id of the element currently in inline text-edit mode. */
  editingId: string | null;
  past: Snapshot[];
  future: Snapshot[];
};

export const initialEditorState: EditorState = {
  elements: [],
  pageList: [],
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
  /** Push the current snapshot onto history — call once at gesture start. */
  | { type: "snapshot" }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset" }
  /** Document (re)load — sets the page list and clears history. */
  | { type: "setPages"; pageList: PageRef[] }
  | { type: "insertPages"; at: number; refs: PageRef[] }
  | { type: "removePage"; at: number }
  | { type: "rotatePage"; at: number }
  | { type: "movePage"; from: number; to: number };

function pushPast(state: EditorState): Pick<EditorState, "past" | "future"> {
  // A double-click fires two pointerdown snapshots with no change in between —
  // dedup by reference so undo steps always represent real edits.
  const top = state.past[state.past.length - 1];
  if (top && top.elements === state.elements && top.pageList === state.pageList)
    return { past: state.past, future: [] };
  const past = [...state.past, { elements: state.elements, pageList: state.pageList }];
  if (past.length > HISTORY_LIMIT) past.shift();
  return { past, future: [] };
}

// ── page-index remapping helpers (applied to every element on page ops) ──

function shiftForInsert(elements: EditorElement[], at: number, n: number): EditorElement[] {
  return elements.map((el) => {
    const patch: Partial<EditorElement> = {};
    if (el.page >= at) patch.page = el.page + n;
    if ("pageFrom" in el) {
      const p = patch as { pageFrom?: number; pageTo?: number };
      if (el.pageFrom >= at) p.pageFrom = el.pageFrom + n;
      if (el.pageTo >= at) p.pageTo = el.pageTo + n;
    }
    return Object.keys(patch).length ? ({ ...el, ...patch } as EditorElement) : el;
  });
}

function shiftForRemove(elements: EditorElement[], at: number): EditorElement[] {
  const out: EditorElement[] = [];
  for (const el of elements) {
    if (!("pageFrom" in el)) {
      if (el.page === at) continue; // element lived on the deleted page
      out.push(el.page > at ? ({ ...el, page: el.page - 1 } as EditorElement) : el);
      continue;
    }
    let from = Math.min(el.pageFrom, el.pageTo);
    let to = Math.max(el.pageFrom, el.pageTo);
    if (at < from) { from -= 1; to -= 1; }
    else if (at <= to) { to -= 1; }
    if (to < from) continue; // single-page range whose page was deleted
    const page = el.page === at ? from : el.page > at ? el.page - 1 : el.page;
    out.push({ ...el, page, pageFrom: from, pageTo: to } as EditorElement);
  }
  return out;
}

function mapForMove(page: number, from: number, to: number): number {
  if (page === from) return to;
  if (from < to && page > from && page <= to) return page - 1;
  if (from > to && page >= to && page < from) return page + 1;
  return page;
}

function shiftForMove(elements: EditorElement[], from: number, to: number): EditorElement[] {
  return elements.map((el) => {
    const page = mapForMove(el.page, from, to);
    if (!("pageFrom" in el)) return page === el.page ? el : ({ ...el, page } as EditorElement);
    const a = mapForMove(el.pageFrom, from, to);
    const b = mapForMove(el.pageTo, from, to);
    return { ...el, page, pageFrom: Math.min(a, b), pageTo: Math.max(a, b) } as EditorElement;
  });
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
        elements: prev.elements,
        pageList: prev.pageList,
        past: state.past.slice(0, -1),
        future: [{ elements: state.elements, pageList: state.pageList }, ...state.future],
        selectedId: null,
        editingId: null,
      };
    }
    case "redo": {
      const next = state.future[0];
      if (!next) return state;
      return {
        ...state,
        elements: next.elements,
        pageList: next.pageList,
        past: [...state.past, { elements: state.elements, pageList: state.pageList }],
        future: state.future.slice(1),
        selectedId: null,
        editingId: null,
      };
    }
    case "reset":
      return initialEditorState;
    case "setPages":
      return { ...initialEditorState, pageList: action.pageList };
    case "insertPages": {
      const pageList = [...state.pageList];
      pageList.splice(action.at, 0, ...action.refs);
      return {
        ...state,
        ...pushPast(state),
        pageList,
        elements: shiftForInsert(state.elements, action.at, action.refs.length),
      };
    }
    case "removePage": {
      if (state.pageList.length <= 1) return state; // never delete the last page
      const pageList = state.pageList.filter((_, i) => i !== action.at);
      return {
        ...state,
        ...pushPast(state),
        pageList,
        elements: shiftForRemove(state.elements, action.at),
        selectedId: null,
        editingId: null,
      };
    }
    case "rotatePage": {
      const ref = state.pageList[action.at];
      if (!ref) return state;
      const rotated: PageRef = {
        ...ref,
        rotate: (((ref.rotate + 90) % 360) as PageRef["rotate"]),
        wPt: ref.hPt,
        hPt: ref.wPt,
      };
      const pageList = state.pageList.map((r, i) => (i === action.at ? rotated : r));
      // Single-page elements on the rotated page visually follow the page;
      // range elements (watermark/pagenum) keep shared coords across pages,
      // so they are left untouched on purpose.
      const elements = state.elements.map((el) => {
        if (el.page !== action.at || "pageFrom" in el) return el;
        return {
          ...el,
          ...rotateRectCW(el),
          rotation: ((el.rotation + 90) % 360),
        } as EditorElement;
      });
      return { ...state, ...pushPast(state), pageList, elements };
    }
    case "movePage": {
      if (action.from === action.to) return state;
      const pageList = [...state.pageList];
      const [ref] = pageList.splice(action.from, 1);
      pageList.splice(action.to, 0, ref);
      return {
        ...state,
        ...pushPast(state),
        pageList,
        elements: shiftForMove(state.elements, action.from, action.to),
      };
    }
    default:
      return state;
  }
}

export const nextZ = (elements: EditorElement[]) =>
  elements.reduce((m, el) => Math.max(m, el.z), 0) + 1;
