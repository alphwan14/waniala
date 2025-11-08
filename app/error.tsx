'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Something went wrong!</h1>
          <p className="text-gray-600 mb-6">
            An unexpected error has occurred. Please try again.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={reset}
              className="btn-primary flex-1"
            >
              Try Again
            </button>
            <Link 
              href="/" 
              className="btn-secondary flex-1"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}