import { Amplify } from "aws-amplify";
import {
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  signUp as amplifySignUp,
  confirmSignUp as amplifyConfirmSignUp,
  resendSignUpCode as amplifyResendSignUpCode,
  resetPassword as amplifyResetPassword,
  confirmResetPassword as amplifyConfirmResetPassword,
  updateUserAttributes as amplifyUpdateUserAttributes,
  fetchUserAttributes as amplifyFetchUserAttributes,
  fetchAuthSession,
  getCurrentUser,
} from "aws-amplify/auth";
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

export async function signIn(email: string, password: string) {
  // Clear any stale auth state that could cause "already in progress" errors
  try { await amplifySignOut(); } catch {}
  return amplifySignIn({ username: email, password });
}

export async function signOut(): Promise<void> {
  await amplifySignOut();
}

export async function signUp(email: string, password: string) {
  return amplifySignUp({ username: email, password, options: { userAttributes: { email } } });
}

export async function confirmSignUp(email: string, code: string) {
  return amplifyConfirmSignUp({ username: email, confirmationCode: code });
}

export async function resendSignUpCode(email: string) {
  return amplifyResendSignUpCode({ username: email });
}

export async function resetPassword(email: string) {
  return amplifyResetPassword({ username: email });
}

export async function confirmResetPassword(email: string, code: string, newPassword: string) {
  return amplifyConfirmResetPassword({ username: email, confirmationCode: code, newPassword });
}

export async function updateUserAttributes(attributes: Record<string, string>) {
  const userAttributes: Record<string, string> = {};
  for (const [key, value] of Object.entries(attributes)) {
    userAttributes[key] = value;
  }
  return amplifyUpdateUserAttributes({ userAttributes });
}

export async function fetchUserAttributes() {
  return amplifyFetchUserAttributes();
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
