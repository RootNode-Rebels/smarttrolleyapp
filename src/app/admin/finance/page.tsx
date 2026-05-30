'use client'

import { useState, useEffect } from 'react'
import { getFinanceData } from '@/lib/actions'
import { TrendingUp, DollarSign, PieChart, Activity } from 'lucide-react'

export default function FinanceDashboard() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getFinanceData().then(d => {
      setData(d)
      setIsLoading(false)
    })
  }, [])

  if (isLoading) {
    return <div className="text-white">Loading Finance Data...</div>
  }

  const { metrics, transactions } = data

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">Finance & Sales Dashboard</h2>
        <p className="text-slate-400 text-sm">Monitor revenue, profit, and transaction history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign className="w-16 h-16 text-blue-500" />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Total Revenue</p>
          <h3 className="text-3xl font-mono font-bold text-white">₹{metrics.totalRevenue.toFixed(2)}</h3>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="w-16 h-16 text-emerald-500" />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Gross Profit</p>
          <h3 className="text-3xl font-mono font-bold text-emerald-400">₹{metrics.grossProfit.toFixed(2)}</h3>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <PieChart className="w-16 h-16 text-orange-500" />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Tax Collected (GST)</p>
          <h3 className="text-3xl font-mono font-bold text-orange-400">₹{metrics.taxCollected.toFixed(2)}</h3>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity className="w-16 h-16 text-purple-500" />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Total Transactions</p>
          <h3 className="text-3xl font-mono font-bold text-purple-400">{transactions.length}</h3>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-950/80 text-slate-400 font-medium">
              <tr>
                <th className="p-5 font-semibold">Transaction ID</th>
                <th className="p-5 font-semibold">Date & Time</th>
                <th className="p-5 font-semibold">Payment Mode</th>
                <th className="p-5 font-semibold text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-slate-500">No transactions recorded yet.</td>
                </tr>
              ) : (
                transactions.slice(0, 50).map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-5 font-mono text-slate-400">TXN-{tx.id.substring(0,8)}</td>
                    <td className="p-5 text-white">{new Date(tx.createdAt).toLocaleString()}</td>
                    <td className="p-5">
                      <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-700">
                        {tx.paymentMode}
                      </span>
                    </td>
                    <td className="p-5 text-right font-mono font-bold text-emerald-400">₹{tx.totalAmount.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
