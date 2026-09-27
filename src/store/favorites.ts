import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  ids: string[];
  recent: string[];
  toggle: (id: string) => boolean;
  has: (id: string) => boolean;
  addRecent: (id: string) => void;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      recent: [],
      toggle: (id) => {
        const exists = get().ids.includes(id);
        set({ ids: exists ? get().ids.filter((x) => x !== id) : [id, ...get().ids] });
        return !exists;
      },
      has: (id) => get().ids.includes(id),
      addRecent: (id) =>
        set({ recent: [id, ...get().recent.filter((x) => x !== id)].slice(0, 8) }),
    }),
    { name: "nhadat-hub-favorites" },
  ),
);
