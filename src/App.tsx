import { useCallback, useEffect, useState } from "react"
import { HangmanDrawing } from "./HangmanDrawing"
import { HangmanWord } from "./HangmanWord"
import { db } from "./firebase"
import { Keyboard } from "./Keyboard"
import words from "./wordList.ts"
import { onAuthStateChanged, signOut, type User } from "firebase/auth"
import { auth } from "./firebase"
import Login from "./components/Login"
import Signup from "./components/Signup"
import { saveScore } from "./saveScore"
import { doc, getDoc } from "firebase/firestore"
import { Leaderboard } from "./components/Leaderboard"


function getWord() {
  return words[Math.floor(Math.random() * words.length)]
}

function App() {
  const [wordToGuess, setWordToGuess] = useState(getWord)
  const [guessedLetters, setGuessedLetters] = useState<string[]>([])

  const [score, setScore] = useState(0)

  const [scoreLoaded, setScoreLoaded] = useState(false)
  const [hasScoredThisRound, setHasScoredThisRound] = useState(false)


  const [user, setUser] = useState<User | null>(null)
  const [showSignup, setShowSignup] = useState(false)

  const incorrectLetters = guessedLetters.filter(
    letter => !wordToGuess.includes(letter)
  )

  const isLoser = incorrectLetters.length >= 6
  const isWinner = wordToGuess
    .split("")
    .every(letter => guessedLetters.includes(letter))

  const addGuessedLetter = useCallback(
    (letter: string) => {
      if (guessedLetters.includes(letter) || isLoser || isWinner) return

      setGuessedLetters(currentLetters => [...currentLetters, letter])
    },
    [guessedLetters, isWinner, isLoser]
  )

  useEffect(() => {
    if (!user) return

    const handler = (e: KeyboardEvent) => {
      // ignore if focus is in an input or textarea
      if (
        document.activeElement &&
        (document.activeElement.tagName === "INPUT" ||
          document.activeElement.tagName === "TEXTAREA")
      ) {
        return
      }

      const key = e.key
      if (!key.match(/^[a-z]$/)) return

      e.preventDefault()
      addGuessedLetter(key)
    }

    document.addEventListener("keypress", handler)
    return () => document.removeEventListener("keypress", handler)
  }, [guessedLetters, user])


  useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    const key = e.key
    if (key !== "Enter") return

    e.preventDefault()
    setGuessedLetters([])
    setWordToGuess(getWord())
    setHasScoredThisRound(false) // Reset score tracking on new round
  }

  document.addEventListener("keypress", handler)

  return () => {
    document.removeEventListener("keypress", handler)
  }
}, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      setUser(currentUser)
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "scores", currentUser.uid))
          if (userDoc.exists()) {
            setScore(userDoc.data().score || 0)
          }
        } catch (error) {
          console.error("Error fetching user score:", error)
        } finally {
          setScoreLoaded(true)
        }
      } else {
        setScoreLoaded(false)
      }
    })
    return unsubscribe
  }, [])

  useEffect(() => {
  if (!scoreLoaded || !user || !isWinner || hasScoredThisRound) return

  const newScore = score + 1
  setScore(newScore)
  saveScore(user.uid, newScore)
    .then(() => console.log("Score saved:", newScore))
    .catch(err => console.error("Error saving score:", err))

  setHasScoredThisRound(true) // prevent duplicate saves
}, [isWinner, user, scoreLoaded, hasScoredThisRound])


  if (!user) {
    return showSignup ? (
      <>
        <Signup />
        <p style={{ textAlign: "center" }}>
          Already have an account?{" "}
          <button onClick={() => setShowSignup(false)}>Log In</button>
        </p>
      </>
    ) : (
      <>
        <Login />
        <p style={{ textAlign: "center" }}>
          Don't have an account?{" "}
          <button onClick={() => setShowSignup(true)}>Sign Up</button>
        </p>
      </>
    )
  }


  return (
    <>
      <div style={{ width: "100%", textAlign: "right", padding: "1rem" }}>
        <button onClick={() => signOut(auth)}>Logout</button>
      </div>

      <div
        style={{
          maxWidth: "800px",
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
          margin: "0 auto",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: "2rem", textAlign: "center" }}>
          {isWinner && "Winner! - Refresh to try again"}
          {isLoser && "Nice Try - Refresh to try again"}
        </div>
        <p style={{ fontSize: "1.5rem" }}>Your Score: {score}</p>
        <HangmanDrawing numberOfGuesses={incorrectLetters.length} />
        <HangmanWord
          reveal={isLoser}
          guessedLetters={guessedLetters}
          wordToGuess={wordToGuess}
        />
        <div style={{ alignSelf: "stretch" }}>
          <Keyboard
            disabled={isWinner || isLoser}
            activeLetters={guessedLetters.filter(letter =>
              wordToGuess.includes(letter)
            )}
            inactiveLetters={incorrectLetters}
            addGuessedLetter={addGuessedLetter}
          />
        </div>
        <Leaderboard />

      </div>
    </>
  )

}

export default App