import { Stethoscope } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
}

export default function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 border-4 border-black rotate-45"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-black rotate-12"></div>
        <div className="absolute bottom-20 left-32 w-12 h-12 border-4 border-black"></div>
        <div className="absolute bottom-40 right-10 w-24 h-24 border-4 border-black rotate-45"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-black p-4 border-4 border-black" style={{ boxShadow: '8px 8px 0px 0px black' }}>
              <Stethoscope className="h-12 w-12 text-white" />
            </div>
            <div className="ml-4">
              <h1 className="text-6xl font-black text-black tracking-tighter">SAGE</h1>
            </div>
          </div>
          <div className="neo-card p-6 mb-6">
            <h2 className="text-2xl font-black text-black mb-2 uppercase tracking-wide">
              Your Personal AI Health Assistant
            </h2>
            <p className="text-lg font-bold text-gray-600 uppercase tracking-wide">
              Discover a Healthier You with AI
            </p>
          </div>
          <h3 className="text-3xl font-black text-black uppercase tracking-wide">{title}</h3>
        </div>
        
        {/* Auth Card */}
        <div className="neo-card p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
