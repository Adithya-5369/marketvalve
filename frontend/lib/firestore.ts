import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore"
import app from "./firebase"

const db = getFirestore(app)

/**
 * Save user data to Firestore.
 * Path: users/{uid}/{collection} → single document with data array
 * Also mirrors to localStorage as fallback.
 */
export async function saveUserData(uid: string, collection: string, data: any) {
  // Always save to localStorage first (instant, offline-capable)
  localStorage.setItem(`mv_${uid}_${collection}`, JSON.stringify(data))

  // Then persist to Firestore
  try {
    const ref = doc(db, "users", uid, "data", collection)
    await setDoc(ref, { items: data, updatedAt: new Date().toISOString() })
  } catch (e) {
    console.warn("Firestore save failed (using localStorage fallback):", e)
  }
}

/**
 * Load user data from Firestore (falls back to localStorage).
 */
export async function loadUserData(uid: string, collection: string): Promise<any[] | null> {
  try {
    const ref = doc(db, "users", uid, "data", collection)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const data = snap.data().items
      // Sync to localStorage
      localStorage.setItem(`mv_${uid}_${collection}`, JSON.stringify(data))
      return data
    }
  } catch (e) {
    console.warn("Firestore load failed (using localStorage fallback):", e)
  }

  // Fallback to localStorage
  try {
    const local = localStorage.getItem(`mv_${uid}_${collection}`)
    return local ? JSON.parse(local) : null
  } catch {
    return null
  }
}

export { db }
