# Technical Context

## Technology Stack

### Frontend
- **React**: JavaScript library for building user interfaces
- **Next.js**: React framework for server-side rendering, routing, and development tools
- **CSS Modules**: For component-scoped styling
- **Laravel Echo**: Client library for WebSocket connections
- **Pusher.js**: Real-time WebSocket client

### Backend (Unchanged)
- **Laravel**: PHP framework for web application development
- **MySQL**: Relational database for data storage
- **Laravel Broadcasting**: Server-side WebSocket implementation
- **Laravel Sanctum**: Authentication system
- **Laravel Events**: Event broadcasting system

### Development Tools
- **npm/Yarn**: Package management for JavaScript dependencies
- **Composer**: PHP dependency management
- **Git**: Version control
- **Laravel Mix**: Asset compilation tool
- **ESLint/Prettier**: Code style and formatting tools

## Environment Setup

### Local Development Requirements
- Node.js (v14+)
- PHP (v8.0+)
- Composer
- MySQL (v5.7+)
- Laragon/LAMP/WAMP/MAMP stack (recommended for PHP development)

### Configuration
- Laravel `.env` file for backend configuration
- Next.js configuration in `next.config.js`
- WebSocket credentials for Pusher

## Key Dependencies

### Frontend Dependencies
```json
{
  "dependencies": {
    "next": "^13.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "laravel-echo": "^1.15.0",
    "pusher-js": "^8.0.0",
    "axios": "^1.3.0"
  }
}
```

### Backend Dependencies (Unchanged)
```json
{
  "require": {
    "php": "^8.0",
    "laravel/framework": "^10.0",
    "laravel/sanctum": "^3.2",
    "pusher/pusher-php-server": "^7.0"
  }
}
```

## API Structure

### Authentication Endpoints
- `POST /api/auth/register`: User registration
- `POST /api/auth/login`: User login
- `POST /api/guest-login`: Guest player login
- `POST /api/logout`: User logout

### Game Endpoints
- `GET /api/game/matches`: List available matches
- `POST /api/game/matches`: Create a new match
- `GET /api/game/matches/by-code/{code}`: Find match by code
- `POST /api/game/matches/{match}/join`: Join an existing match
- `POST /api/game/matches/{match}/move`: Make a move in a match
- `POST /api/game/matches/{match}/end`: End a match
- `POST /api/game/matches/{match}/message`: Send in-game chat message

## Real-time Events

### Broadcast Events
- `PlayerJoined`: When a player joins a match
- `GameMove`: When a player makes a move
- `GameEnded`: When a game ends with a result
- `ChatMessage`: When a chat message is sent

### Event Structure Example
```php
// PHP Event Definition (unchanged)
class GameMove implements ShouldBroadcast
{
    public $match;
    public $move;
    
    public function __construct($match, $move)
    {
        $this->match = $match;
        $this->move = $move;
    }
    
    public function broadcastOn()
    {
        return new PrivateChannel('match.' . $this->match->id);
    }
}
```

```javascript
// JavaScript Event Subscription (updated for React)
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
    cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
    forceTLS: true
});

// Inside a React component
useEffect(() => {
    const channel = window.Echo.private(`match.${matchId}`);
    
    channel.listen('GameMove', (event) => {
        // Update game state with event data
        updateGameBoard(event.move);
    });
    
    return () => {
        channel.stopListening('GameMove');
    };
}, [matchId]);
```

## Database Schema

### Main Tables (Unchanged)
- `users`: User information and authentication
- `game_matches`: Game match information
- `game_rooms`: Room information for matches
- `password_reset_tokens`: For password reset functionality

### Key Relationships
- Users can have multiple matches as player1 or player2
- Each match belongs to two users (player1 and player2)
- Game states are stored in the matches table

## Development Practices

### Code Organization
- Frontend components organized by feature/domain
- Backend follows Laravel's standard MVC architecture
- API routes grouped by domain

### Testing Strategy
- Frontend: Component tests with React Testing Library
- Backend: Feature and unit tests with PHPUnit
- E2E: End-to-end testing with Cypress

### Deployment Considerations
- Frontend: Vercel or similar Next.js-compatible platform
- Backend: Standard Laravel deployment to PHP-enabled hosting
- WebSockets: Requires a service supporting WebSockets (e.g., Pusher) 