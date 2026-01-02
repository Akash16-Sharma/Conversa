import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Conversa',
  description: 'Practice conversations naturally',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-indigo-50 via-white to-pink-50 text-gray-900`}
      >
        {/* ───────── Top Bar ───────── */}
        <header className="sticky top-0 z-50 backdrop-blur bg-white/70 border-b">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            {/* Brand */}
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight flex items-center gap-2"
            >
              💬 <span>Conversa</span>
            </Link>

            {/* Right actions */}
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <Link
                href="/profile"
                className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold shadow"
              >
                U
              </Link>

              {/* Logout */}
              <Link
                href="/logout"
                className="text-sm text-gray-500 hover:text-red-500 transition"
              >
                Logout
              </Link>
            </div>
          </div>
        </header>

        {/* ───────── Main Content ───────── */}
        <main className="min-h-[calc(100vh-140px)]">
          {children}
        </main>

        {/* ───────── Bottom Navigation ───────── */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t">
          <div className="max-w-md mx-auto flex justify-around py-3">
            <Link
              href="/"
              className="flex flex-col items-center text-gray-500 hover:text-indigo-600 transition"
            >
              <span className="text-xl">🏠</span>
              <span className="text-xs">Home</span>
            </Link>

            <Link
              href="/conversations"
              className="flex flex-col items-center text-gray-500 hover:text-indigo-600 transition"
            >
              <span className="text-xl">💬</span>
              <span className="text-xs">Inbox</span>
            </Link>

            <Link
              href="/profile"
              className="flex flex-col items-center text-gray-500 hover:text-indigo-600 transition"
            >
              <span className="text-xl">👤</span>
              <span className="text-xs">Profile</span>
            </Link>
          </div>
        </nav>
      </body>
    </html>
  )
}
