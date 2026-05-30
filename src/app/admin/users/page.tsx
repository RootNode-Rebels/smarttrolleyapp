'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, UserCog, User, ShieldAlert, ShieldCheck } from 'lucide-react'
import { getUsers, createUser, deleteUser } from '@/lib/actions'
import { motion, AnimatePresence } from 'framer-motion'

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    passwordString: '',
    role: 'WORKER'
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const data = await getUsers()
      setUsers(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createUser(formData)
      setModalOpen(false)
      setFormData({ name: '', username: '', passwordString: '', role: 'WORKER' })
      loadUsers()
    } catch (e) {
      alert("Failed to create user. Username might be taken.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string, role: string) => {
    if (role === 'ADMIN' && users.filter(u => u.role === 'ADMIN').length === 1) {
      alert("Cannot delete the last admin!")
      return
    }
    if (confirm("Are you sure you want to delete this user?")) {
      await deleteUser(id)
      loadUsers()
    }
  }

  if (loading) return <div className="text-white p-8">Loading users...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Staff & Roles</h1>
          <p className="text-slate-400">Manage system access and authentication</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Staff Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <motion.div 
            key={user.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative group"
          >
            <div className="absolute top-6 right-6">
              <button 
                onClick={() => handleDelete(user.id, user.role)}
                className="w-10 h-10 rounded-full bg-red-900/20 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-900/40 transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${user.role === 'ADMIN' ? 'bg-purple-900/30' : 'bg-blue-900/30'}`}>
                {user.role === 'ADMIN' ? <ShieldCheck className="w-7 h-7 text-purple-400" /> : <User className="w-7 h-7 text-blue-400" />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{user.name}</h3>
                <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold mt-1 ${user.role === 'ADMIN' ? 'bg-purple-900/50 text-purple-400' : 'bg-blue-900/50 text-blue-400'}`}>
                  {user.role}
                </span>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex justify-between bg-slate-950/50 p-3 rounded-xl">
                <span>Username:</span>
                <span className="font-mono text-slate-200">{user.username}</span>
              </div>
              <div className="flex justify-between bg-slate-950/50 p-3 rounded-xl">
                <span>Joined:</span>
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800">
                <h2 className="text-2xl font-bold text-white">Add Staff Member</h2>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Full Name</label>
                  <input 
                    type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Username</label>
                  <input 
                    type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value.toLowerCase()})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                    placeholder="john123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Password</label>
                  <input 
                    type="password" required value={formData.passwordString} onChange={e => setFormData({...formData, passwordString: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Role</label>
                  <select 
                    value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                  >
                    <option value="WORKER">Worker (POS Only)</option>
                    <option value="ADMIN">Admin (Full Access)</option>
                  </select>
                </div>
                
                <div className="flex gap-4 mt-8">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-xl font-bold">
                    {isSubmitting ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
