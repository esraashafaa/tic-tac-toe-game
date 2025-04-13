import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          Tic Tac Toe
        </h1>
        <p className="text-lg text-gray-300 max-w-md mx-auto">
          The classic game with a modern twist. Play offline or challenge friends online!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <Link href="/auth" className="group">
          <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-8 rounded-xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 border border-gray-700 h-full">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-white group-hover:text-blue-400 transition-colors">Login / Register</h2>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                Create an account or sign in to track your stats and play online
              </p>
            </div>
          </div>
        </Link>

        <Link href="/games/choose" className="group">
          <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-8 rounded-xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 border border-gray-700 h-full">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-white group-hover:text-purple-400 transition-colors">Play as Guest</h2>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                Jump right into a game without creating an account
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-12 text-gray-400 text-sm">
        <p>Already have a code? <Link href="/games/join" className="text-blue-400 hover:text-blue-300 underline">Join a game</Link></p>
        </div>
      </main>
  );
}
