import { useEffect, useState } from "react"
import { db } from "../firebase"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"

type Entry = {
  userId: string
  score: number
}

export function Leaderboard() {
  const [leaders, setLeaders] = useState<Entry[]>([])

  useEffect(() => {
    const fetchLeaders = async () => {
      const q = query(collection(db, "scores"), orderBy("score", "desc"), limit(10))
      const snapshot = await getDocs(q)
      const results = snapshot.docs.map(doc => ({
        userId: doc.id,
        score: doc.data().score,
      }))
      setLeaders(results)
    }

    fetchLeaders()
  }, [])

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2>🏆 Leaderboard</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {leaders.map((entry, index) => (
          <li key={entry.userId}>
            {index + 1}. {entry.userId}: {entry.score}
          </li>
        ))}
      </ul>
    </div>
  )
}
