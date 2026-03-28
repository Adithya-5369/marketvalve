export async function fetchAllStocks() {
  const res = await fetch("http://localhost:8000/stocks")
  if (!res.ok) throw new Error("Failed to fetch stocks")
  return await res.json()
}