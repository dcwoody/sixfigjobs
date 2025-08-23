'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const { token } = params
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setMessage('Passwords do not match')
      return
    }
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      })
      const data = await res.json()
      if (res.ok) {
        setMessage('Password updated. You may now login.')
        setTimeout(() => router.push('/login'), 2000)
      } else {
        setMessage(data.error || 'Reset failed.')
      }
    } catch (err) {
      setMessage('Reset failed.')
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Set New Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="New password"
          required
        />
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Confirm password"
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
          Update Password
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
  )
}
