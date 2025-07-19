// saveScore.ts
import { db } from "./firebase"
import { doc, setDoc } from "firebase/firestore"

export async function saveScore(userId: string, score: number) {
  const scoreRef = doc(db, "scores", userId) // one score per user
  await setDoc(scoreRef, { score }, { merge: true })
}
