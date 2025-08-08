'use client'

import { useState } from 'react'
import { Plus, Trash2, LogOut } from 'lucide-react'

interface Session {
  id: string
  title: string
  createdAt: string
}

interface SidebarProps {
  sessions: Session[]
  currentSessionId: string | null
  analysisCount: number
  maxAnalyses: number
  onNewSession: () => void
  onSelectSession: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
  onLogout: () => void
}

export default function Sidebar({
  sessions,
  currentSessionId,
  analysisCount,
  maxAnalyses,
  onNewSession,
  onSelectSession,
  onDeleteSession,
  onLogout
}: SidebarProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const remaining = maxAnalyses - analysisCount

  const handleDeleteClick = (sessionId: string) => {
    if (deleteConfirmId === sessionId) {
      onDeleteSession(sessionId)
      setDeleteConfirmId(null)
    } else {
      setDeleteConfirmId(sessionId)
    }
  }

  return (
    <div className="neo-sidebar">
      {/* Header */}
      <div className="p-6 border-b-4 border-black bg-white">
        <button
          onClick={onNewSession}
          className="w-full neo-button py-4 px-6 flex items-center justify-center gap-3"
        >
          <Plus className="h-6 w-6" />
          NEW ANALYSIS SESSION
        </button>
      </div>

      {/* Analysis Counter */}
      <div className="p-6 border-b-4 border-black bg-white">
        <div className="neo-card p-4 bg-gray-50 text-center">
          <p className="text-black text-sm font-black mb-2 uppercase tracking-wide">Daily Analysis Limit</p>
          <p className={`text-2xl font-black uppercase tracking-wide ${remaining > 3 ? 'text-black' : 'text-black'}`}>
            {remaining}/{maxAnalyses} REMAINING
          </p>
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <h3 className="text-xl font-black mb-6 uppercase tracking-wide">CHAT SESSIONS</h3>
        {sessions.length === 0 ? (
          <div className="neo-card p-4 text-center">
            <p className="text-black text-sm font-black uppercase tracking-wide">No Previous Sessions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="group">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onSelectSession(session.id)}
                    className={`flex-1 text-left p-4 transition-all duration-200 ${
                      currentSessionId === session.id
                        ? 'neo-session-active'
                        : 'neo-session-inactive'
                    }`}
                  >
                    <div className="text-sm font-black uppercase tracking-wide">📝 {session.title}</div>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(session.id)}
                    className="opacity-0 group-hover:opacity-100 p-3 text-black hover:bg-black hover:text-white border-4 border-black transition-all duration-200"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                {deleteConfirmId === session.id && (
                  <div className="mt-3 neo-card p-4 bg-gray-100">
                    <p className="text-sm text-black font-black mb-3 uppercase tracking-wide">Delete This Session?</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleDeleteClick(session.id)}
                        className="flex-1 bg-black text-white border-4 border-black font-black text-sm py-2 px-3 uppercase tracking-wide hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      >
                        YES
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="flex-1 bg-white text-black border-4 border-black font-black text-sm py-2 px-3 uppercase tracking-wide hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      >
                        NO
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="p-6 border-t-4 border-black bg-white">
        <button
          onClick={onLogout}
          className="w-full neo-button-secondary py-4 px-6 flex items-center justify-center gap-3"
        >
          <LogOut className="h-6 w-6" />
          LOGOUT
        </button>
      </div>
    </div>
  )
}
