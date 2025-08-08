'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Instagram, Linkedin, Menu, Plus, Twitter, Youtube } from 'lucide-react'
import SocialMediaCard from "@/components/social-media-card"
import ContentCreator from "@/components/content-creator"
import StudioSelector from "@/components/studio-selector"
import MobileNavigation from "@/components/mobile-navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/auth')
  }, [router])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-xl font-black uppercase tracking-wide">Loading Sage...</p>
      </div>
    </div>
  )
}
