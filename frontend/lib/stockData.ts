import { API_BASE_URL } from "./api";

export async function fetchAllStocks() {
  const res = await fetch(`${API_BASE_URL}/stocks`)
  if (!res.ok) throw new Error("Failed to fetch stocks")
  return await res.json()
}