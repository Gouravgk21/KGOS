import { create } from 'zustand';

export interface NotificationItem {
  id: number;
  text: string;
  time: string;
  read: boolean;
}

interface AppStoreState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  notifications: NotificationItem[];
  clearNotifications: () => void;
  addNotification: (text: string) => void;
}

export const useAppStore = create<AppStoreState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),
  notifications: [
    { id: 1, text: 'Heritage Foods lead stage moved to Trial', time: '10 mins ago', read: false },
    { id: 2, text: 'Habit check-in streak updated to 5 days', time: '2 hours ago', read: true }
  ],
  clearNotifications: () => set({ notifications: [] }),
  addNotification: (text) => set((s) => ({
    notifications: [{ id: Date.now(), text, time: 'Just now', read: false }, ...s.notifications]
  }))
}));
