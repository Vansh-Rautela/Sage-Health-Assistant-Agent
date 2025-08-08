'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface SignupFormProps {
  onToggleForm: () => void
  onSignup: (name: string, email: string, password: string, confirmPassword: string) => void
  isLoading: boolean
}

export default function SignupForm({ onToggleForm, onSignup, isLoading }: SignupFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name && email && password && confirmPassword) {
      onSignup(name, email, password, confirmPassword)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-lg font-black text-black mb-3 uppercase tracking-wide">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="neo-input"
          placeholder="ENTER YOUR FULL NAME"
          required
        />
      </div>

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

      <div>
        <label htmlFor="confirmPassword" className="block text-lg font-black text-black mb-3 uppercase tracking-wide">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="neo-input pr-16"
            placeholder="CONFIRM YOUR PASSWORD"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black hover:bg-gray-100 p-2 border-2 border-black"
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="neo-card p-4 bg-gray-50">
        <p className="text-sm font-black text-black mb-2 uppercase tracking-wide">Password Requirements:</p>
        <ul className="text-sm font-bold text-gray-700 space-y-1 uppercase">
          <li>• AT LEAST 8 CHARACTERS</li>
          <li>• ONE UPPERCASE LETTER</li>
          <li>• ONE LOWERCASE LETTER</li>
          <li>• ONE NUMBER</li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full neo-button py-4 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
      </button>

      <button
        type="button"
        onClick={onToggleForm}
        className="w-full neo-button-secondary py-4 px-6"
      >
        ALREADY HAVE AN ACCOUNT? LOGIN
      </button>
    </form>
  )
}
