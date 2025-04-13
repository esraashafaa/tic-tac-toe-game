'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ChooseGameMode() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3">Choose Game Mode</h1>
        <p className="text-gray-400">Select how you want to play Tic Tac Toe</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
        {/* Offline Mode */}
        <div 
          onClick={() => router.push('/games/offline')}
          className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-6 shadow-lg cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl border border-gray-700"
        >
          <div className="flex flex-col items-center text-center h-full">
            <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-3">Offline Mode</h2>
            <p className="text-gray-400 mb-6">Play against a friend on the same device</p>
            <div className="mt-auto">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-colors">
                Play Now
              </button>
            </div>
          </div>
        </div>

        {/* Online Mode */}
        <div 
          onClick={() => router.push('/games/online')}
          className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-6 shadow-lg cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl border border-gray-700"
        >
          <div className="flex flex-col items-center text-center h-full">
            <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-3">Online Mode</h2>
            <p className="text-gray-400 mb-6">Play against other players online</p>
            <div className="mt-auto">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full transition-colors">
                Play Online
              </button>
            </div>
          </div>
        </div>

        {/* AI Mode (Coming Soon) */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-6 shadow-lg border border-gray-700 opacity-70">
          <div className="flex flex-col items-center text-center h-full">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-3">AI Opponent</h2>
            <p className="text-gray-400 mb-6">Challenge our AI at different difficulty levels</p>
            <div className="mt-auto">
              <button disabled className="bg-gray-600 text-gray-300 px-6 py-2 rounded-full cursor-not-allowed">
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <Link href="/" className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
} 