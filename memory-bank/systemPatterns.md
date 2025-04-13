# System Patterns

## Architecture Overview
The Tic Tac Toe game follows a client-server architecture with real-time communication capabilities:

```mermaid
flowchart TD
    Client[React/Next.js Frontend] <--> |HTTP/WebSockets| Server[Laravel API Backend]
    Server <--> |SQL Queries| DB[MySQL Database]
    
    subgraph Frontend Components
        GameBoard[Game Board Component]
        Auth[Authentication Components]
        Lobby[Game Lobby/Setup]
        Chat[Chat Component]
        Stats[Statistics Display]
    end
    
    subgraph Backend Services
        API[RESTful API Controllers]
        Auth[Authentication Service]
        Game[Game Logic Service]
        Broadcast[Broadcasting Service]
    end
```

## Key Technical Decisions

### 1. Frontend Framework
- **Decision**: Use React with Next.js (replacing vanilla JavaScript)
- **Rationale**: React's component-based architecture allows for better code organization and reusability, while Next.js provides server-side rendering and simplified routing.

### 2. State Management
- **Decision**: Use React Context API for global state management with local component state where appropriate
- **Rationale**: For a game of this complexity, Context API provides sufficient state management without introducing additional libraries.

### 3. Real-time Communication
- **Decision**: Maintain Laravel Echo/Pusher for WebSocket communication
- **Rationale**: Leveraging the existing Laravel broadcasting system with React integration allows for efficient real-time updates.

### 4. API Architecture
- **Decision**: RESTful API endpoints with Laravel controllers
- **Rationale**: Standard REST patterns provide a consistent interface for the frontend to interact with the backend.

### 5. Database Schema
- **Decision**: Relational database with normalized tables
- **Rationale**: Game data has well-defined relationships that benefit from a structured relational approach.

## Component Relationships

### Frontend Components
- **Game Board**: Core component that displays the game grid and handles player moves
- **Game Mode Selection**: Handles selection between offline and online play
- **Match Creation/Joining**: Manages the creation of new games and joining existing ones
- **Chat System**: Enables real-time communication between players
- **Player Status**: Shows current player turn and game status
- **Statistics Display**: Shows player performance metrics

### Backend Components
- **Authentication Controllers**: Handle user registration, login, and guest access
- **Game Match Controller**: Manages game creation, joining, and state updates
- **Game Logic Service**: Handles game rules, win conditions, and state validation
- **Broadcasting Events**: Manages real-time events for game moves and chat messages

## Data Flow

### Game Initialization Flow
```mermaid
sequenceDiagram
    participant User
    participant React as React Frontend
    participant API as Laravel API
    participant DB as Database
    
    User->>React: Select game mode
    alt Online Mode
        React->>API: Create game (POST /api/game/matches)
        API->>DB: Store new game
        API-->>React: Return match code
        React->>User: Display match code to share
    else Offline Mode
        React->>React: Initialize local game state
    end
```

### Online Game Move Flow
```mermaid
sequenceDiagram
    participant Player1
    participant Player2
    participant React1 as Player1 React
    participant React2 as Player2 React
    participant API as Laravel API
    participant WS as WebSocket
    
    Player1->>React1: Makes a move
    React1->>API: Send move (POST /api/game/matches/{id}/move)
    API->>API: Validate move
    API->>WS: Broadcast GameMove event
    WS-->>React2: Receive move update
    React2->>React2: Update game board
    React2->>Player2: Display updated board
```

## Design Patterns

1. **MVC Pattern**: 
   - Laravel controllers handle API requests
   - React components manage views
   - Laravel models represent data structure

2. **Observer Pattern**:
   - WebSocket events notify components of state changes
   - React components subscribe to state updates

3. **Repository Pattern**:
   - API service modules abstract data fetching in the frontend
   - Laravel models encapsulate database operations

4. **Factory Pattern**:
   - Game state initialization for different game modes
   - Component creation based on game context

5. **Strategy Pattern**:
   - Different game logic for online vs. offline modes
   - Separation of win condition checks from game state management 