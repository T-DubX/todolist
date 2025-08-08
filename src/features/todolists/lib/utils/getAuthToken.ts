import { AUTH_TOKEN } from "@/common/constants"

export const getAuthToken = () => {
  if (typeof window === "undefined") return null

  try {
    const token = localStorage.getItem(AUTH_TOKEN)
    return token ? JSON.parse(token) : null
  } catch (e) {
    localStorage.removeItem(AUTH_TOKEN)
    return null
  }
}
