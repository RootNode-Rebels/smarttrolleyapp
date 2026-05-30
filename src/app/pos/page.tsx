'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Camera, Ban, ShoppingBasket, Trash2, CreditCard, Banknote, QrCode } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import Scanner from '@/components/Scanner'
import { lookupProduct, getInventory, processTransaction } from '@/lib/actions'

export default function POSPage() {
  const [scannerActive, setScannerActive] = useState(false)
  const [barcodeInput, setBarcodeInput] = useState('')
  const [inventory, setInventory] = useState<any[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [showUpiQr, setShowUpiQr] = useState(false)
  const upiId = 'adhiam@ptyes'
  
  const cart = useCartStore(state => state.cart)
  const addItem = useCartStore(state => state.addItem)
  const removeItem = useCartStore(state => state.removeItem)
  const clearCart = useCartStore(state => state.clearCart)
  const getTotal = useCartStore(state => state.getTotal)
  
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getInventory().then(setInventory)
    inputRef.current?.focus()
  }, [])

  const handleScan = async (code: string) => {
    if (!code) return
    const product = await lookupProduct(code)
    if (product) {
      addItem({
        barcode: product.barcode,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl
      })
    } else {
      alert('Product not found and could not be retrieved from API.')
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleScan(barcodeInput)
    setBarcodeInput('')
    inputRef.current?.focus()
  }

  const handlePayment = async (mode: string) => {
    if (cart.length === 0) return

    if (mode === 'UPI' && !showUpiQr) {
      setShowUpiQr(true)
      return
    }

    setIsProcessing(true)
    try {
      const tx = await processTransaction(cart.map(i => ({ barcode: i.barcode, qty: i.qty })))
      if (tx) {
        setPaymentModalOpen(false)
        setShowUpiQr(false)
        // Need to keep cart data for receipt before clearing it.
        // Actually, we can trigger print before clearing cart, then clear after 1s.
        setTimeout(() => {
          window.print()
          setTimeout(() => clearCart(), 1000)
        }, 100)
      }
    } catch (e) {
      alert("Error processing transaction")
    } finally {
      setIsProcessing(false)
    }
  }

  const subtotal = getTotal()
  const tax = subtotal * 0.18
  const total = subtotal + tax

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-[72px] border-b border-slate-800/60 flex items-center justify-between px-6 bg-slate-900/40 backdrop-blur-md no-print z-10">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-lg text-slate-100">Billing Terminal</h2>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${scannerActive ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-red-900/30 text-red-400 border-red-800/50'}`}>
              {scannerActive ? 'Scanner Active' : 'Scanner Offline'}
            </span>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setScannerActive(!scannerActive)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all flex items-center gap-2 ${scannerActive ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'}`}
            >
              <Camera className="w-4 h-4" /> {scannerActive ? 'Stop Camera' : 'Start Camera'}
            </button>
            <button 
              onClick={() => clearCart()}
              className="px-4 py-2.5 bg-red-950/40 text-red-400 hover:bg-red-900/60 hover:text-red-300 rounded-xl text-sm font-medium border border-red-900/50 transition-all flex items-center gap-2"
            >
              <Ban className="w-4 h-4" /> Cancel Order
            </button>
          </div>
        </header>

        {/* Main Workspace */}
        <div className="flex-1 p-6 overflow-y-auto no-print scroll-smooth">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Scanner Component */}
            <AnimatePresence>
              {scannerActive && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="overflow-hidden"
                >
                  <Scanner isActive={scannerActive} onScan={handleScan} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Box */}
            <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">Product Lookup</label>
              <form onSubmit={handleManualSubmit} className="flex gap-4 relative z-10">
                <div className="relative flex-1">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    ref={inputRef}
                    type="text" 
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Scan or type barcode (e.g. 101)" 
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-2xl py-4 pl-14 pr-4 text-white font-mono text-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none placeholder:text-slate-600 shadow-inner"
                    autoFocus
                  />
                </div>
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-10 rounded-2xl font-bold transition-all transform active:scale-95 shadow-lg shadow-blue-900/20">
                  ENTER
                </button>
              </form>
            </div>
            
            {/* Quick Keys */}
            <div className="mt-8">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Quick Access
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {inventory.slice(0, 12).map((item) => (
                  <button 
                    key={item.barcode}
                    onClick={() => handleScan(item.barcode)}
                    className="bg-slate-900/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 text-left transition-all group relative overflow-hidden flex flex-col gap-1"
                  >
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <QrCode className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-[10px] font-mono font-bold text-blue-400/70 group-hover:text-blue-400 transition-colors">#{item.barcode}</div>
                    <div className="font-semibold text-slate-200 text-sm truncate pr-4">{item.name}</div>
                    <div className="text-xs text-slate-500 mt-1">₹{item.price.toFixed(2)}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bill Panel */}
      <aside className="w-[400px] bg-slate-900 border-l border-slate-800 flex flex-col h-full shrink-0 relative z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
        <div className="p-6 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
          <h3 className="font-bold text-lg text-white mb-1">Current Order</h3>
          <p className="text-xs font-mono text-slate-500">TXN-{Math.floor(Math.random() * 90000) + 10000}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
          <AnimatePresence>
            {cart.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-slate-600 opacity-60 gap-4"
              >
                <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center">
                  <ShoppingBasket className="w-10 h-10 text-slate-500" />
                </div>
                <p className="font-medium text-sm">Cart is empty</p>
              </motion.div>
            ) : (
              cart.map((item) => (
                <motion.div 
                  key={item.barcode}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  className="bg-slate-950 p-4 rounded-2xl border border-slate-800/50 flex gap-4 group hover:border-slate-700 transition-colors shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-100 font-semibold text-sm truncate mb-1">{item.name}</div>
                    <div className="text-[11px] text-slate-400 flex gap-2">
                      <span className="font-mono text-blue-400">₹{item.price.toFixed(2)}</span>
                      <span>×</span>
                      <span className="font-bold text-white bg-slate-800 px-1.5 rounded">{item.qty}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <span className="font-mono font-bold text-white">₹{(item.price * item.qty).toFixed(2)}</span>
                    <button 
                      onClick={() => removeItem(item.barcode)} 
                      className="text-red-500/50 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 bg-slate-950 border-t border-slate-800 relative z-30">
          <div className="absolute -top-10 left-0 w-full h-10 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
          
          <div className="space-y-3 mb-6 text-sm">
            <div className="flex justify-between text-slate-400 items-center">
              <span>Subtotal</span>
              <span className="font-mono">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400 items-center">
              <span>Tax <span className="text-[10px] bg-slate-800 px-1 rounded ml-1">18% GST</span></span>
              <span className="font-mono text-slate-300">₹{tax.toFixed(2)}</span>
            </div>
            <div className="w-full h-px bg-slate-800 my-2" />
            <div className="flex justify-between items-end">
              <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">Total</span>
              <span className="text-4xl font-mono font-bold text-emerald-400 tracking-tighter">₹{total.toFixed(2)}</span>
            </div>
          </div>
          
          <button 
            onClick={() => { setPaymentModalOpen(true); setShowUpiQr(false); }}
            disabled={cart.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white py-4 rounded-2xl font-bold text-lg shadow-[0_0_40px_rgba(37,99,235,0.2)] transition-all transform active:scale-[0.98] flex items-center justify-center gap-3"
          >
            Pay Now
          </button>
        </div>
      </aside>

      {/* Payment Modal */}
      <AnimatePresence>
        {paymentModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-900 w-full max-w-md rounded-[2rem] border border-slate-700 p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
              <h3 className="text-2xl font-bold text-white mb-2 text-center">Complete Payment</h3>
              <p className="text-center text-slate-400 mb-8 font-mono text-xl">₹{total.toFixed(2)}</p>
              
              {showUpiQr ? (
                <div className="flex flex-col items-center mb-8">
                  <div className="bg-white p-4 rounded-2xl mb-4">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=SuperPOS&am=${total.toFixed(2)}`)}&size=200x200`} 
                      alt="UPI QR Code" 
                      className="w-48 h-48"
                    />
                  </div>
                  <p className="text-slate-400 text-sm mb-4">Scan with any UPI App (GPay, PhonePe, Paytm)</p>
                  <button 
                    onClick={() => handlePayment('UPI')}
                    disabled={isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold transition-all"
                  >
                    Confirm Payment Received
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button 
                    onClick={() => handlePayment('CASH')}
                    disabled={isProcessing}
                    className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-6 rounded-3xl flex flex-col items-center gap-4 transition-all group"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Banknote className="w-7 h-7 text-emerald-400" />
                    </div>
                    <span className="text-sm font-bold text-slate-300">CASH</span>
                  </button>
                  <button 
                    onClick={() => handlePayment('UPI')}
                    disabled={isProcessing}
                    className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-6 rounded-3xl flex flex-col items-center gap-4 transition-all group"
                  >
                    <div className="w-14 h-14 rounded-full bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <QrCode className="w-7 h-7 text-blue-400" />
                    </div>
                    <span className="text-sm font-bold text-slate-300">UPI</span>
                  </button>
                  <button 
                    onClick={() => handlePayment('CARD')}
                    disabled={isProcessing}
                    className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-6 rounded-3xl flex flex-col items-center gap-4 transition-all group col-span-2"
                  >
                    <div className="w-14 h-14 rounded-full bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CreditCard className="w-7 h-7 text-purple-400" />
                    </div>
                    <span className="text-sm font-bold text-slate-300">CARD / NFC</span>
                  </button>
                </div>
              )}

              <button 
                onClick={() => setPaymentModalOpen(false)}
                disabled={isProcessing}
                className="w-full py-4 text-sm font-bold text-slate-500 hover:text-slate-300 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Hidden Print Receipt */}
      <div className="hidden print-area w-[80mm] p-4 text-black bg-white mx-auto font-mono text-sm" style={{ display: 'none' }}>
        <div className="text-center mb-4">
          <h2 className="font-bold text-xl mb-1">SUPERPOS PRO</h2>
          <p className="text-xs">123 Retail Avenue, Business District</p>
          <p className="text-xs">GSTIN: 22AAAAA0000A1Z5</p>
          <div className="w-full border-b border-dashed border-black my-2"></div>
          <p className="text-xs">Date: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
          <div className="w-full border-b border-dashed border-black my-2"></div>
        </div>

        <div className="mb-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-black">
                <th className="text-left pb-1">Item</th>
                <th className="text-right pb-1">Qty</th>
                <th className="text-right pb-1">Price</th>
                <th className="text-right pb-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {cart.map(item => (
                <tr key={item.barcode}>
                  <td className="py-1 pr-2">{item.name}</td>
                  <td className="py-1 text-right">{item.qty}</td>
                  <td className="py-1 text-right">{item.price.toFixed(2)}</td>
                  <td className="py-1 text-right">{(item.price * item.qty).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="w-full border-b border-dashed border-black my-2"></div>
        
        <div className="space-y-1 text-xs mb-4">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>CGST (9%):</span>
            <span>₹{(tax / 2).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>SGST (9%):</span>
            <span>₹{(tax / 2).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm mt-2 border-t border-black pt-1">
            <span>GRAND TOTAL:</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>

        <div className="text-center text-xs mt-8">
          <p>Thank you for shopping with us!</p>
          <p>Please visit again.</p>
        </div>
      </div>
    </div>
  )
}
