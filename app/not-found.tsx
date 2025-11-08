import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-6">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <Link 
            href="/" 
            className="btn-primary inline-block"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}