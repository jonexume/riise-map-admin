import { Amplify } from "aws-amplify";
import { signIn as amplifySignIn, signOut as amplifySignOut, fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;

if (!userPoolId || !clientId) {
  throw new Error("Missing VITE_COGNITO_USER_POOL_ID or VITE_COGNITO_CLIENT_ID");
}

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId,
      userPoolClientId: clientId,
    },
  },
});

export async function getAccessToken(): Promise<string | null> {
  try {
    const { tokens } = await fetchAuthSession();
    return tokens?.idToken?.toString() ?? null;
  } catch {
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
}

export async function signIn(email: string, password: string): Promise<void> {
  await amplifySignIn({ username: email, password });
}

export async function signOut(): Promise<void> {
  await amplifySignOut();
}

export function onAuthStateChange(callback: (authenticated: boolean) => void): { unsubscribe: () => void } {
  const remove = Hub.listen("auth", ({ payload }) => {
    switch (payload.event) {
      case "signedIn":
        callback(true);
        break;
      case "signedOut":
      case "tokenRefresh_failure":
        callback(false);
        break;
    }
  });
  return { unsubscribe: remove };
}
