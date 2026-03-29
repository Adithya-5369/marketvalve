"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { User, signInWithPopup, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { MarketValveLogo } from "@/components/logo"

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, pass: string) => Promise<void>
  signUpWithEmail: (email: string, pass: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
})

export const useAuth = () => useContext(AuthContext)

// Helper: get localStorage key prefixed by user UID
export function userKey(uid: string, key: string) {
  return `mv_${uid}_${key}`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)



  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
      
      // If user logs out while on a deep page, push them back to home
      if (!user && pathname !== "/" && pathname !== "") {
        router.push("/")
      }
    })
    return unsubscribe
  }, [pathname, router])

  async function signInWithGoogle() {
    try { await signInWithPopup(auth, googleProvider) } catch (error: any) { console.error("Auth error:", error.message) }
  }

  async function signInWithEmail(email: string, pass: string) {
    try { await signInWithEmailAndPassword(auth, email, pass) } catch (error: any) { alert("Login failed: " + error.message) }
  }

  async function signUpWithEmail(email: string, pass: string) {
    try { await createUserWithEmailAndPassword(auth, email, pass) } catch (error: any) { alert("Sign up failed: " + error.message) }
  }

  async function logout() {
    await signOut(auth)
    router.push("/")
  }

  async function resetPassword(email: string) {
    try { 
      await sendPasswordResetEmail(auth, email) 
      alert("Password reset email sent! Check your inbox.")
    } catch (error: any) { 
      alert("Reset failed: " + error.message) 
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center animate-pulse mb-3">
            <MarketValveLogo className="w-12 h-12" />
          </div>
          <p className="text-sm text-muted-foreground">Loading MarketValve...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen onGoogleLogin={signInWithGoogle} onEmailLogin={signInWithEmail} onEmailSignUp={signUpWithEmail} onResetPassword={resetPassword} />
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

function LoginScreen({ onGoogleLogin, onEmailLogin, onEmailSignUp, onResetPassword }: { onGoogleLogin: () => void, onEmailLogin: (e:string, p:string) => void, onEmailSignUp: (e:string, p:string) => void, onResetPassword: (e:string) => void }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    if (isSignUp) await onEmailSignUp(email, password)
    else await onEmailLogin(email, password)
    setLoading(false)
  }

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .login-card { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
      `}</style>
      <div className="login-card w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mx-auto mb-4">
            <MarketValveLogo className="w-16 h-16 drop-shadow-md" />
          </div>
          <h1 className="text-2xl tracking-tight">
            <span className="font-bold">MARKET</span>
            <span className="font-normal">VALVE</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">AI Investor Copilot</p>
        </div>

        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <input 
              type="email" 
              placeholder="Email address" 
              className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/50"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/50"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
            
            {!isSignUp && (
              <div className="flex justify-end pt-1">
                <button 
                  type="button" 
                  onClick={() => {
                    if (!email) alert("Please enter your email address first.")
                    else onResetPassword(email)
                  }} 
                  className="text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" className="w-full h-11 rounded-xl" disabled={loading}>
              {loading ? "Please wait..." : (isSignUp ? "Sign Up" : "Sign In")}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or</span></div>
          </div>

          <Button onClick={onGoogleLogin} variant="outline" className="w-full h-11 text-sm gap-3 rounded-xl border-border hover:bg-muted">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-4">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-primary hover:underline font-medium">
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>

        <p className="text-[10px] text-muted-foreground text-center mt-6">
          Your data is safely synced to the cloud via Firestore.
        </p>
      </div>
    </div>
  )
}
