import { createContext, useContext, useEffect, useState } from "react";
import { fetchUserAttributes, signOut } from "@/lib/auth";

interface UserData {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  orgName: string;
  orgType: string;
}

interface UserContextValue {
  user: UserData;
  loading: boolean;
  logout: () => Promise<void>;
}

const defaultUser: UserData = { firstName: "", lastName: "", fullName: "", email: "", orgName: "", orgType: "" };

const UserContext = createContext<UserContextValue>({ user: defaultUser, loading: true, logout: signOut });

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData>(defaultUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserAttributes().then((attrs) => {
      const firstName = attrs.given_name || "";
      const lastName = attrs.family_name || "";
      setUser({
        firstName,
        lastName,
        fullName: [firstName, lastName].filter(Boolean).join(" ") || attrs.email || "",
        email: attrs.email || "",
        orgName: (attrs as any)["custom:org_name"] || "",
        orgType: (attrs as any)["custom:org_type"] || "",
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, logout: signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
