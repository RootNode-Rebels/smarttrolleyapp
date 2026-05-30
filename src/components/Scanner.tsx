'use client'

import { useEffect, useRef } from 'react'
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode'

interface ScannerProps {
  onScan: (decodedText: string) => void
  isActive: boolean
}

export default function Scanner({ onScan, isActive }: ScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    let isMounted = true

    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode('qr-reader')
    }

    const scanner = scannerRef.current

    if (isActive) {
      if (scanner.getState() === Html5QrcodeScannerState.NOT_STARTED) {
        scanner
          .start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              if (isMounted) onScan(decodedText)
              // Play beep
              try {
                new Audio('https://www.soundjay.com/buttons/beep-01a.mp3').play()
              } catch (e) {}
              
              // Prevent double scanning
              if (scanner.getState() === Html5QrcodeScannerState.SCANNING) {
                scanner.pause()
                setTimeout(() => {
                  if (isMounted && scanner.getState() === Html5QrcodeScannerState.PAUSED) {
                    scanner.resume()
                  }
                }, 1500)
              }
            },
            () => {} // ignore errors
          )
          .catch((err) => {
            console.error('Camera error', err)
          })
      } else if (scanner.getState() === Html5QrcodeScannerState.PAUSED) {
        scanner.resume()
      }
    } else {
      if (scanner.getState() === Html5QrcodeScannerState.SCANNING || scanner.getState() === Html5QrcodeScannerState.PAUSED) {
        scanner.stop().catch(console.error)
      }
    }

    return () => {
      isMounted = false
      if (scanner && (scanner.getState() === Html5QrcodeScannerState.SCANNING || scanner.getState() === Html5QrcodeScannerState.PAUSED)) {
        scanner.stop().catch(console.error)
      }
    }
  }, [isActive, onScan])

  if (!isActive) return null

  return (
    <div className="relative bg-black rounded-2xl overflow-hidden border border-slate-700 shadow-2xl h-64 w-full flex items-center justify-center">
      <div id="qr-reader" className="w-full h-full"></div>
      <div className="absolute inset-0 border-2 border-blue-500/50 pointer-events-none m-8 rounded-xl opacity-50 shadow-[0_0_20px_rgba(59,130,246,0.3)]"></div>
      <div className="absolute bottom-4 left-0 w-full text-center text-xs font-bold tracking-widest text-white/70 uppercase">
        Point at barcode
      </div>
    </div>
  )
}
