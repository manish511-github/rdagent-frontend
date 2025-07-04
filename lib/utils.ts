import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import Cookies from "js-cookie"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function refreshAccessToken() {
  const refreshToken = Cookies.get("refresh_token")
  if (!refreshToken) return null

  const response = await fetch("http://localhost:8000/auth/refresh", {
    method: "POST",
    headers: {
      "refresh-token": refreshToken,
    },
  })

  if (!response.ok) {
    Cookies.remove("access_token")
    Cookies.remove("refresh_token")
    return null
  }

  const data = await response.json()
  Cookies.set("access_token", data.access_token, { expires: 1/24 })
  Cookies.set("refresh_token", data.refresh_token, { expires: 7 })
  return data.access_token
}
