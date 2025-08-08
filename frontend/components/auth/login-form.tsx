'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface LoginFormProps {
  onToggleForm: () => void
  onLogin: (email: string, password: string) => void
  isLoading: boolean
}

export default function LoginForm({ onToggleForm, onLogin, isLoading }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && password) {
      onLogin(email, password)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-lg font-black text-black mb-3 uppercase tracking-wide">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="neo-input"
          placeholder="ENTER YOUR EMAIL"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-lg font-black text-black mb-3 uppercase tracking-wide">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="neo-input pr-16"
            placeholder="ENTER YOUR PASSWORD"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black hover:bg-gray-100 p-2 border-2 border-black"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full neo-button py-4 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'LOGGING IN...' : 'LOGIN'}
      </button>

      <button
        type="button"
        onClick={onToggleForm}
        className="w-full neo-button-secondary py-4 px-6"
      >
        DON'T HAVE AN ACCOUNT? SIGN UP
      </button>
    </form>
  )
}
