'use client'

import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, MonitorSmartphone, PackageSearch, History } from 'lucide-react'
import { logout } from '@/lib/actions'

export default function POSLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [time, setTime] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const navItems = [
    { href: '/pos', icon: MonitorSmartphone, label: 'Billing Terminal' },
    // Only Admin gets these links easily, though for now we can just show them or hide them based on role.
    // For simplicity, we just put history.
  ]

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[280px] bg-slate-900 border-r border-slate-800 flex flex-col no-print shrink-0 z-20 shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex items-center gap-4 bg-slate-900/50 backdrop-blur-md">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg shadow-blue-500/20 text-white">
            S
          </div>
          <div>
            <h1 className="font-bold text-xl leading-none text-white tracking-tight">SuperPOS</h1>
            <span className="text-xs text-blue-400 font-medium">v3.0 Enterprise</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20 translate-x-1'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-5 bg-slate-900 border-t border-slate-800 mt-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Shift Status</span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Online
            </span>
          </div>
          <div className="text-lg font-bold text-white mb-1">Operator ID</div>
          <div className="text-sm font-mono text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800 text-center shadow-inner">
            {time || '00:00:00'}
          </div>
          <button 
            onClick={handleLogout}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-950/30 hover:bg-red-900/50 text-red-400 rounded-lg text-sm border border-red-900/50 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen min-w-0 bg-[#0a0f1c]">
        {children}
      </main>
    </div>
  )
}
