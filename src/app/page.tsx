'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { KeyRound, LogIn } from 'lucide-react'
import { loginWithPin } from '@/lib/actions'

export default function LoginPage() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const res = await loginWithPin(pin)
      if (res.success) {
        if (res.role === 'ADMIN') {
          router.push('/admin')
        } else {
          router.push('/pos')
        }
      } else {
        setError(res.error || 'Login failed')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNumpad = (num: string) => {
    if (pin.length < 4) setPin((prev) => prev + num)
  }

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1))
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 mb-4">
            <span className="text-3xl font-bold text-white">S</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">SuperPOS Pro</h1>
          <p className="text-slate-400">Enter your PIN to access the terminal</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-8">
            <div className="flex justify-center gap-4 mb-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    i < pin.length ? 'bg-blue-500 scale-125' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm text-center mt-4"
              >
                {error}
              </motion.p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleNumpad(num.toString())}
                className="h-16 rounded-2xl bg-slate-800/50 hover:bg-slate-700 border border-slate-700/50 text-2xl font-mono text-white transition active:scale-95 flex items-center justify-center"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPin('')}
              className="h-16 rounded-2xl bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 text-red-400 transition active:scale-95 flex items-center justify-center"
            >
              C
            </button>
            <button
              type="button"
              onClick={() => handleNumpad('0')}
              className="h-16 rounded-2xl bg-slate-800/50 hover:bg-slate-700 border border-slate-700/50 text-2xl font-mono text-white transition active:scale-95 flex items-center justify-center"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="h-16 rounded-2xl bg-slate-800/50 hover:bg-slate-700 border border-slate-700/50 text-slate-400 transition active:scale-95 flex items-center justify-center"
            >
              ⌫
            </button>
          </div>

          <button
            type="submit"
            disabled={pin.length !== 4 || isLoading}
            className="w-full h-14 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Login
              </>
            )}
          </button>
          
          <div className="mt-4 text-center text-xs text-slate-500">
            <p>Admin PIN: 1234 | Worker PIN: 0000</p>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
