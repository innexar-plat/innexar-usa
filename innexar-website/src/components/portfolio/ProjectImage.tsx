'use client'

import { ComponentType, useEffect, useState } from 'react'

interface ProjectImageProps {
  gradient: string
  icon: ComponentType<{ className?: string }>
  iconColor: string
  title: string
  category: string
}

export default function ProjectImage({ gradient, icon: Icon, iconColor, title, category }: ProjectImageProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`w-full h-full bg-gradient-to-br ${gradient} relative overflow-hidden`} style={{ minHeight: '256px' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-white/40 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradient} relative overflow-hidden`} style={{ minHeight: '256px' }}>
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}></div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-4 right-4 w-16 h-16 bg-white/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-4 left-4 w-20 h-20 bg-white/20 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      
      {/* Mock interface elements based on category */}
      {category === 'web' && (
        <div>
          {/* Browser mockup - more visible */}
          <div className="absolute top-4 left-4 right-4 h-10 bg-white/30 rounded-t-xl backdrop-blur-md border border-white/30 shadow-lg">
            <div className="flex items-center gap-2 px-4 h-full">
              <div className="w-3 h-3 rounded-full bg-white/60 shadow-sm"></div>
              <div className="w-3 h-3 rounded-full bg-white/60 shadow-sm"></div>
              <div className="w-3 h-3 rounded-full bg-white/60 shadow-sm"></div>
              <div className="flex-1 h-5 bg-white/40 rounded ml-4"></div>
            </div>
          </div>
          {/* Content blocks - more visible */}
          <div className="absolute top-16 left-4 right-4 space-y-3">
            <div className="h-5 bg-white/35 rounded-lg w-3/4 shadow-md"></div>
            <div className="h-5 bg-white/30 rounded-lg w-1/2 shadow-md"></div>
            <div className="h-24 bg-white/25 rounded-xl mt-4 shadow-md border border-white/20"></div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="h-20 bg-white/25 rounded-lg shadow-md border border-white/20"></div>
              <div className="h-20 bg-white/25 rounded-lg shadow-md border border-white/20"></div>
              <div className="h-20 bg-white/25 rounded-lg shadow-md border border-white/20"></div>
            </div>
          </div>
        </div>
      )}
      
      {category === 'mobile' && (
        <div>
          {/* Phone mockup - more visible */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-36 h-64 bg-black/50 rounded-[2.5rem] border-4 border-white/40 backdrop-blur-md shadow-2xl">
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-white/50 rounded-full"></div>
            <div className="p-5 h-full flex flex-col gap-3">
              <div className="h-10 bg-white/30 rounded-xl shadow-md"></div>
              <div className="flex-1 bg-white/20 rounded-xl shadow-md"></div>
              <div className="h-16 bg-white/30 rounded-xl shadow-md"></div>
              <div className="h-12 bg-white/25 rounded-xl shadow-md"></div>
            </div>
          </div>
        </div>
      )}
      
      {category === 'cloud' && (
        <>
          {/* Cloud/Server visualization - more visible */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2">
            <div className="relative">
              {/* Cloud shape */}
              <div className="w-48 h-28 bg-white/35 rounded-full shadow-lg border border-white/30"></div>
              <div className="absolute -top-6 left-10 w-24 h-24 bg-white/35 rounded-full shadow-lg border border-white/30"></div>
              <div className="absolute -top-6 right-10 w-24 h-24 bg-white/35 rounded-full shadow-lg border border-white/30"></div>
              {/* Server boxes */}
              <div className="absolute top-20 left-6 w-16 h-16 bg-white/30 rounded-lg shadow-md border border-white/30"></div>
              <div className="absolute top-20 left-1/2 -translate-x-1/2 w-16 h-16 bg-white/30 rounded-lg shadow-md border border-white/30"></div>
              <div className="absolute top-20 right-6 w-16 h-16 bg-white/30 rounded-lg shadow-md border border-white/30"></div>
            </div>
          </div>
          {/* Connection lines - using divs instead of SVG to avoid hydration issues */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <div className="absolute left-[20%] top-[65%] w-[30%] h-0.5 bg-white transform rotate-12 origin-left"></div>
            <div className="absolute right-[20%] top-[65%] w-[30%] h-0.5 bg-white transform -rotate-12 origin-right"></div>
            <div className="absolute left-1/2 top-[45%] w-0.5 h-[10%] bg-white transform -translate-x-1/2"></div>
          </div>
        </>
      )}
      
      {category === 'data' && (
        <div>
          {/* Dashboard mockup - more visible */}
          <div className="absolute top-6 left-4 right-4 space-y-3">
            <div className="h-8 bg-white/35 rounded-lg w-2/3 shadow-md"></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-24 bg-white/30 rounded-xl flex items-center justify-center shadow-md border border-white/20">
                <div className="w-16 h-16 border-4 border-white/60 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="h-24 bg-white/30 rounded-xl shadow-md border border-white/20"></div>
            </div>
            <div className="h-28 bg-white/25 rounded-xl relative shadow-md border border-white/20 p-3">
              {/* Chart bars - more visible */}
              <div className="absolute bottom-3 left-4 w-6 bg-white/60 rounded-t" style={{ height: '60%' }}></div>
              <div className="absolute bottom-3 left-12 w-6 bg-white/70 rounded-t" style={{ height: '80%' }}></div>
              <div className="absolute bottom-3 left-20 w-6 bg-white/60 rounded-t" style={{ height: '45%' }}></div>
              <div className="absolute bottom-3 left-28 w-6 bg-white/80 rounded-t" style={{ height: '90%' }}></div>
              <div className="absolute bottom-3 left-36 w-6 bg-white/60 rounded-t" style={{ height: '55%' }}></div>
              <div className="absolute bottom-3 left-44 w-6 bg-white/70 rounded-t" style={{ height: '75%' }}></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Icon overlay (centered, smaller) */}
      {Icon && (
        <div className="absolute bottom-6 right-6">
          <Icon className={`h-10 w-10 ${iconColor} drop-shadow-lg opacity-90`} />
        </div>
      )}
    </div>
  )
}

