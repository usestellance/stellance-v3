import { create } from "zustand";

interface VariableStore {
  notificationsCount: number;
  notificationsPage: number;
  notificationsOrder: "DESC" | "ASC";
  setNotificationsCount: (count: number) => void;
  setNotificationsPage: (count: number) => void;
  setNotificationsOrder: (order: "DESC" | "ASC") => void;
}

export const useVariableStore = create<VariableStore>((set) => ({
  notificationsCount: 5,
  notificationsPage: 1,
  notificationsOrder: "DESC",
  setNotificationsCount: (count) => set({ notificationsCount: count }),
  setNotificationsPage: (page) => set({ notificationsPage: page }),
  setNotificationsOrder: (order) => set({ notificationsOrder: order }),
}));
