'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
              <div className="text-6xl mb-4">🚨</div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">Critical Error</h1>
              <p className="text-gray-600 mb-6">
                A critical error has occurred. Please refresh the page.
              </p>
              <button
                onClick={() => reset()}
                className="btn-primary"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}