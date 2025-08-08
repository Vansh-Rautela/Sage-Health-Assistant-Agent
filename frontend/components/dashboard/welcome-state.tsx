import { Plus, Stethoscope } from 'lucide-react'

interface WelcomeStateProps {
  onNewSession: () => void
}

export default function WelcomeState({ onNewSession }: WelcomeStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 border-4 border-black rotate-45"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-black rotate-12"></div>
        <div className="absolute bottom-32 left-40 w-20 h-20 border-4 border-black"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 border-4 border-black rotate-45"></div>
      </div>
      
      <div className="text-center max-w-2xl relative z-10">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-black p-6 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <Stethoscope className="h-20 w-20 text-white" />
          </div>
        </div>
        
        <div className="neo-card p-8 mb-8">
          <h2 className="text-5xl font-black text-black mb-4 uppercase tracking-tighter">WELCOME TO SAGE</h2>
          <p className="text-xl font-bold text-gray-700 uppercase tracking-wide">
            Your Personal AI Health Assistant is ready to analyze your medical reports and provide detailed insights.
          </p>
        </div>
        
        <button
          onClick={onNewSession}
          className="neo-button py-6 px-12 text-xl flex items-center justify-center gap-4 mx-auto"
        >
          <Plus className="h-8 w-8" />
          CREATE NEW ANALYSIS SESSION
        </button>
      </div>
    </div>
  )
}
