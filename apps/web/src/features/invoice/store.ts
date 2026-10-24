import { create } from "zustand";
import { InvoiceItemsTypes } from "@/features/invoice/types";
// import { invoiceItems } from "@/lib/utils";

export type InvoiceStatus =
  | "all"
  | "draft"
  | "sent"
  | "paid"
  | "overdue"
  | "viewed"
  | "cancelled"
  | "pending"
  | "expired"
  | "invalid_payment";

interface InvoiceFilterState {
  search: string;
  status: InvoiceStatus;
  page: number;
  order_by: "desc" | "asc";
  size: number;
  setPage: (page: number) => void;
  //   setOrderBy: (order: "asc" | "dsc") => void;
  //   setPageCount: (count: number) => void;
  setSearchTerm: (value: string) => void;
  setStatus: (value: InvoiceStatus) => void;
  resetFilters: () => void;
}

interface CommentFilterState {
  page: number;
  sort_order: "desc" | "asc";
  limit: number;
  setPage: (page: number) => void;
  // setOrderBy: (order: "asc" | "dsc") => void;
  //   setPageCount: (count: number) => void;
  resetFilters: () => void;
}

export const useInvoiceFilter = create<InvoiceFilterState>((set) => ({
  page: 1,
  order_by: "desc",
  size: 10,
  search: "",
  status: "all",

  setSearchTerm: (value) => set({ search: value }),
  setStatus: (value) => set({ status: value }),
  setPage: (page) => set({ page }),
  //   setOrderBy: (order_by) => set({ order_by }),
  //   setPageCount: (page_count) => set({ page_count }),

  resetFilters: () =>
    set({
      search: "",
      status: "all",
    }),
}));

export const useReceiptFilter = create<InvoiceFilterState>((set) => ({
  page: 1,
  size: 10,
  order_by: "desc",
  search: "",
  status: "paid",

  setSearchTerm: (value) => set({ search: value }),
  setStatus: (value) => set({ status: value }),
  setPage: (page) => set({ page }),
  // setOrderBy: (order_by) => set({ order_by }),
  //   setPageCount: (page_count) => set({ page_count }),

  resetFilters: () =>
    set({
      search: "",
      status: "paid",
    }),
}));

interface InvoiceItemsStore {
  items: InvoiceItemsTypes[];
  editingIndex: number | null;
  addItems: (item: InvoiceItemsTypes[]) => void;
  addItem: (item: InvoiceItemsTypes) => void;
  updateItem: (item: InvoiceItemsTypes) => void;
  setEditingIndex: (index: number | null) => void;
  removeItem: (index: number) => void;
  clearItems: () => void;
  openDrawer: boolean;
  setOpenDrawer: (open: boolean) => void;
}

export const useInvoiceItems = create<InvoiceItemsStore>((set) => ({
  items: [],
  editingIndex: null,

  addItems: (items) =>
    set((state) => ({
      items: [...state.items, ...items],
    })),

  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),

  updateItem: (item) =>
    set((state) =>
      state.editingIndex !== null
        ? {
            items: state.items.map((it, idx) =>
              idx === state.editingIndex ? item : it,
            ),
            editingIndex: null,
          }
        : state,
    ),

  setEditingIndex: (index) => set({ editingIndex: index }),

  removeItem: (index) =>
    set((state) => ({
      items: state.items.filter((_, i) => i !== index),
    })),

  clearItems: () => set({ items: [], editingIndex: null }),

  openDrawer: false,
  setOpenDrawer: (open) => set({ openDrawer: open }),
}));

export const useCommentFilter = create<CommentFilterState>((set) => ({
  page: 1,
  sort_order: "asc",
  limit: 100,

  setPage: (page) => set({ page }),
  //   setOrderBy: (order_by) => set({ order_by }),
  //   setPageCount: (page_count) => set({ page_count }),

  resetFilters: () =>
    set({
      page: 1,
    }),
}));
