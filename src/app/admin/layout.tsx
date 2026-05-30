'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, PackageSearch, History, MonitorSmartphone, Users } from 'lucide-react'
import { logout } from '@/lib/actions'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const navItems = [
    { href: '/admin', icon: PackageSearch, label: 'Inventory Manager' },
    { href: '/admin/finance', icon: History, label: 'Finance & Sales' },
    { href: '/admin/users', icon: Users, label: 'Staff & Roles' },
    { href: '/pos', icon: MonitorSmartphone, label: 'Switch to POS' },
  ]

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden">
      <aside className="w-[280px] bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 z-20">
        <div className="p-6 border-b border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center font-bold text-2xl text-white">
            A
          </div>
          <div>
            <h1 className="font-bold text-xl text-white">Admin Panel</h1>
            <span className="text-xs text-purple-400">SuperPOS Pro</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                    : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-5 mt-auto">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-400 rounded-xl border border-slate-700 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Exit Admin
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#0a0f1c] p-8">
        {children}
      </main>
    </div>
  )
}
