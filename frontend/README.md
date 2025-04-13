# Tic Tac Toe Game - React Frontend

This is the React/Next.js frontend for the Tic Tac Toe game, which connects to a Laravel backend API.

## Features

- Modern UI built with React, Next.js, and Tailwind CSS
- Offline mode for local play
- Online multiplayer with real-time updates using WebSockets
- Responsive design for mobile and desktop
- Game state management using React hooks
- Chat functionality in online games

## Project Structure

```
frontend/
  ├── app/                   # Next.js App Router pages
  │   ├── games/            # Game-related pages
  │   │   ├── choose/       # Game mode selection page
  │   │   ├── offline/      # Offline game page
  │   │   └── online/       # Online game page
  │   ├── auth/             # Authentication pages
  │   ├── layout.tsx        # Root layout
  │   └── page.tsx          # Home page
  ├── src/
  │   ├── components/       # React components
  │   │   ├── game/         # Game-related components
  │   │   ├── auth/         # Authentication components
  │   │   ├── layout/       # Layout components
  │   │   └── ui/           # UI components
  │   ├── hooks/            # Custom React hooks
  │   └── services/         # API services
  └── public/               # Static assets
```

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- Laravel backend API running

### Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Create `.env.local` file with required environment variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   NEXT_PUBLIC_PUSHER_APP_KEY=your_pusher_key
   NEXT_PUBLIC_PUSHER_APP_CLUSTER=your_pusher_cluster
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Key Components

### Game Board (`GameBoard.tsx`)
The core component that renders the Tic Tac Toe grid and handles player interaction.

### Game Status (`GameStatus.tsx`)
Displays the current game status, including player turns, scores, and match results.

### Game Result Modal (`GameResultModal.tsx`)
Modal that appears at the end of a game showing the result and allowing players to play again or return home.

### Online Game Lobby (`OnlineGameLobby.tsx`)
Interface for creating and joining online games.

## Custom Hooks

### `useGameLogic`
Manages the game state, including the board, player turns, and win/draw detection.

### `useGameWebSocket`
Handles WebSocket connections for real-time updates in online games.

## Connecting to the Backend

The game communicates with the Laravel backend through RESTful API endpoints defined in `gameService.ts`. WebSocket events are handled using Laravel Echo, which is integrated through the `useGameWebSocket` hook.

## Development

This project follows these patterns:

- Client-side rendering for interactive pages
- TypeScript for type safety
- Component organization by domain/feature
- Custom hooks for shared logic
- Tailwind CSS for styling

## Building for Production

```
npm run build
```

The built application will be in the `.next` directory and can be deployed to platforms like Vercel or hosted alongside the Laravel backend.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
