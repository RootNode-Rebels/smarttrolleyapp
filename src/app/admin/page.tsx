'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Trash2, Edit2, AlertCircle } from 'lucide-react'
import { getInventory, addProduct, deleteProduct } from '@/lib/actions'

export default function AdminPage() {
  const [inventory, setInventory] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const [formData, setFormData] = useState({ barcode: '', name: '', price: '', costPrice: '', stock: '' })

  const fetchInventory = async () => {
    setIsLoading(true)
    const data = await getInventory()
    setInventory(data)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    await addProduct({
      barcode: formData.barcode,
      name: formData.name,
      price: parseFloat(formData.price),
      costPrice: parseFloat(formData.costPrice || '0'),
      stock: parseInt(formData.stock),
    })
    setIsModalOpen(false)
    setFormData({ barcode: '', name: '', price: '', costPrice: '', stock: '' })
    fetchInventory()
  }

  const handleDelete = async (barcode: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(barcode)
      fetchInventory()
    }
  }

  const filtered = inventory.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.barcode.includes(search)
  )

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Inventory Management</h2>
          <p className="text-slate-400 text-sm">Manage your products, pricing, and stock levels.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-purple-900/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search products by name or barcode..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-12 pr-4 text-sm text-white focus:border-purple-500 outline-none transition-colors"
            />
          </div>
          <div className="text-sm font-medium text-slate-400">
            Total Products: <span className="text-white">{inventory.length}</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-950/80 text-slate-400 font-medium">
              <tr>
                <th className="p-5 font-semibold">Barcode</th>
                <th className="p-5 font-semibold">Product Name</th>
                <th className="p-5 font-semibold text-right">Cost</th>
                <th className="p-5 font-semibold text-right">Price</th>
                <th className="p-5 font-semibold text-center">Stock Level</th>
                <th className="p-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-500">Loading inventory...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-500">No products found.</td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.barcode} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="p-5 font-mono text-slate-400">{item.barcode}</td>
                    <td className="p-5 font-bold text-white">{item.name}</td>
                    <td className="p-5 text-right font-mono text-slate-400">₹{(item.costPrice || 0).toFixed(2)}</td>
                    <td className="p-5 text-right font-mono text-emerald-400">₹{item.price.toFixed(2)}</td>
                    <td className="p-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${item.stock < 10 ? 'bg-red-900/20 text-red-400 border-red-900/50' : 'bg-emerald-900/20 text-emerald-400 border-emerald-900/50'}`}>
                        {item.stock < 10 && <AlertCircle className="w-3 h-3" />}
                        {item.stock}
                      </span>
                    </td>
                    <td className="p-5 text-right space-x-2">
                      <button 
                        onClick={() => {
                          setFormData({ barcode: item.barcode, name: item.name, price: item.price.toString(), costPrice: (item.costPrice || 0).toString(), stock: item.stock.toString() })
                          setIsModalOpen(true)
                        }}
                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors inline-block"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.barcode)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors inline-block"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-700 p-8 shadow-2xl relative"
            >
              <h3 className="text-xl font-bold text-white mb-6">Product Details</h3>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Barcode</label>
                  <input 
                    required
                    type="text" 
                    value={formData.barcode}
                    onChange={e => setFormData({...formData, barcode: e.target.value})}
                    placeholder="e.g. 8901030303"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Product Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Fresh Milk"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Cost (₹)</label>
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      value={formData.costPrice}
                      onChange={e => setFormData({...formData, costPrice: e.target.value})}
                      placeholder="0.00"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono focus:border-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Price (₹)</label>
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      placeholder="0.00"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono focus:border-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Stock</label>
                    <input 
                      required
                      type="number" 
                      value={formData.stock}
                      onChange={e => setFormData({...formData, stock: e.target.value})}
                      placeholder="0"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono focus:border-purple-500 outline-none"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-medium text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-3 font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition-colors">
                    Save Product
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
