// signOutClient.ts
import fetchWrapper from "@lib/wrappers/fetchWrapper";

export const signOutClient = async () => {
  try {
    await fetchWrapper.post("/auth/sign-out", {});
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    window.location.href = "/auth";
  }
};
