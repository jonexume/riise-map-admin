import { createContext, useContext, useState } from "react";
import { alerts } from "@/data/mockData";

const initialCount = alerts.filter(a => (a.status as string) !== "Resolved" && (a.status as string) !== "Dismissed").length;

interface AlertContextType {
  unresolvedCount: number;
  setUnresolvedCount: (count: number) => void;
}

const AlertContext = createContext<AlertContextType>({
  unresolvedCount: initialCount,
  setUnresolvedCount: () => {},
});

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [unresolvedCount, setUnresolvedCount] = useState(initialCount);
  return (
    <AlertContext.Provider value={{ unresolvedCount, setUnresolvedCount }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlertCount() {
  return useContext(AlertContext);
}
