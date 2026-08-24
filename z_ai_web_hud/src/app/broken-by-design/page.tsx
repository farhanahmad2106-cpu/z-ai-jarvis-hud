'use client'

import BrokenByDesign from '@/components/ui/broken-by-design'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function BrokenByDesignPage() {
  return (
    <main className="relative min-h-screen w-full bg-[#030407] text-white">
      <div className="absolute top-6 left-6 z-50">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-mono tracking-wider hover:bg-white/20 transition-all shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" /> BACK TO JARVIS HUD
        </Link>
      </div>

      <BrokenByDesign title="broken by design." height="100vh" />
    </main>
  )
}
