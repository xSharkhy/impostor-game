# API Reference

El Impostor uses Socket.io for real-time communication. This document covers all events and their payloads.

## Connection

### Authentication

Socket connections require a valid JWT token from Supabase:

```typescript
import { io } from 'socket.io-client';

const socket = io('https://api.yourdomain.com', {
  auth: {
    token: supabaseSession.access_token
  },
  transports: ['websocket']
});
```

### Connection Events

```typescript
socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});
```

---

## Client → Server Events

### Room Events

#### `room:create`

Create a new game room.

```typescript
socket.emit('room:create', {
  language: 'es' // 'es' | 'en' | 'ca' | 'eu' | 'gl'
});
```

**Response**: `room:created` with room code.

---

#### `room:join`

Join an existing room.

```typescript
socket.emit('room:join', {
  code: 'ABCD' // 4-character room code
});
```

**Response**: `room:state` with full room data.

**Errors**:
- `ROOM_NOT_FOUND` - Room doesn't exist
- `GAME_ALREADY_STARTED` - Can't join mid-game

---

#### `room:leave`

Leave the current room.

```typescript
socket.emit('room:leave');
```

**Response**: Server broadcasts `room:playerLeft` to remaining players.

---

#### `room:kick`

Kick a player (admin only).

```typescript
socket.emit('room:kick', {
  playerId: 'player-uuid'
});
```

**Response**: `room:playerKicked` broadcast to all players.

**Errors**:
- `NOT_ADMIN` - Only room admin can kick

---

#### `room:changeLanguage`

Change the room's language (admin only).

```typescript
socket.emit('room:changeLanguage', {
  language: 'en'
});
```

**Response**: `room:languageChanged` broadcast.

---

### Game Events

#### `game:start`

Start the game (admin only).

```typescript
// Classic mode - random word from category
socket.emit('game:start', {
  mode: 'classic',
  category: 'animals',
  impostorCount: 1  // Optional: 1-6 impostors (default: 1)
});

// Random mode - word from RAE dictionary (Spanish only)
socket.emit('game:start', {
  mode: 'random',
  impostorCount: 2  // Multiple impostors for larger groups
});

// Custom mode - admin provides word
socket.emit('game:start', {
  mode: 'custom',
  customWord: 'elephant',
  impostorCount: 1
});

// Roulette mode - players submit words
socket.emit('game:start', {
  mode: 'roulette',
  impostorCount: 1
});
```

**Impostor Count Rules**:
- Minimum: 1, Maximum: 6
- Requires `impostorCount × 2` players minimum
- Example: 2 impostors need 4+ players, 3 impostors need 6+ players

**Response**:
- Classic/Random/Custom: `game:started` with word data
- Roulette: `game:collectingStarted` to begin word collection phase

**Errors**:
- `NOT_ADMIN` - Only admin can start
- `NOT_ENOUGH_PLAYERS` - Need at least 3 players
- `INVALID_STATE` - Invalid impostor count for player count

---

#### `game:submitWord`

Submit a word during roulette collection phase.

```typescript
socket.emit('game:submitWord', {
  word: 'mountain'
});
```

**Response**: `game:wordCollected` with updated count.

---

#### `game:forceStart`

Force start roulette game if enough words collected (admin only).

```typescript
socket.emit('game:forceStart');
```

---

#### `game:nextRound`

Advance to next round (admin only).

```typescript
socket.emit('game:nextRound');
```

**Response**: `game:newRound` with round number.

---

#### `game:playAgain`

Reset game and return to lobby (admin only).

```typescript
socket.emit('game:playAgain');
```

**Response**: `room:state` with reset room.

---

### Voting Events

#### `game:startVoting`

Start the voting phase (admin only).

```typescript
socket.emit('game:startVoting');
```

**Response**: `game:votingStarted` broadcast.

---

#### `vote:cast`

Cast your vote.

```typescript
socket.emit('vote:cast', {
  targetId: 'player-uuid'
});
```

**Response**: `vote:update` broadcast with current votes.

**Errors**:
- `INVALID_STATE` - Not in voting phase
- `ALREADY_VOTED` - Can only vote once
- `CANNOT_VOTE_SELF` - Can't vote for yourself

---

#### `vote:confirm`

Confirm vote and process elimination (admin only).

```typescript
socket.emit('vote:confirm', {
  eliminate: true // or false to skip elimination
});
```

**Response**:
- `vote:result` with elimination info
- `game:ended` if game is over

---

### Word Events

#### `word:suggest`

Suggest a new word.

```typescript
socket.emit('word:suggest', {
  word: 'penguin',
  categoryId: 'animals-uuid',
  lang: 'en'
});
```

---

#### `word:getCategories`

Get available categories.

```typescript
socket.emit('word:getCategories');
```

**Response**: `word:categories` with category list.

---

### User Events

#### `user:updateDisplayName`

Update your display name.

```typescript
socket.emit('user:updateDisplayName', {
  displayName: 'NewName'
});
```

---

## Server → Client Events

### Room Events

#### `room:created`

Room was successfully created.

```typescript
socket.on('room:created', (data) => {
  // data.code: string (e.g., 'ABCD')
});
```

---

#### `room:state`

Full room state (sent on join or after changes).

```typescript
socket.on('room:state', (room: ClientRoom) => {
  // room.id: string
  // room.code: string
  // room.adminId: string
  // room.status: 'lobby' | 'collecting_words' | 'playing' | 'voting' | 'finished'
  // room.language: SupportedLanguage
  // room.players: Player[]
  // room.currentWord?: string | null (null if you're the impostor)
  // room.currentRound: number
});
```

---

#### `room:playerJoined`

A player joined the room.

```typescript
socket.on('room:playerJoined', (player: Player) => {
  // player.id: string
  // player.displayName: string
  // player.isConnected: boolean
  // player.isEliminated: boolean
});
```

---

#### `room:playerLeft`

A player left the room.

```typescript
socket.on('room:playerLeft', (data) => {
  // data.playerId: string
});
```

---

#### `room:playerKicked`

A player was kicked.

```typescript
socket.on('room:playerKicked', (data) => {
  // data.playerId: string
});
```

---

#### `room:adminChanged`

Room admin changed (when previous admin leaves).

```typescript
socket.on('room:adminChanged', (data) => {
  // data.newAdminId: string
});
```

---

#### `room:languageChanged`

Room language changed.

```typescript
socket.on('room:languageChanged', (data) => {
  // data.language: SupportedLanguage
});
```

---

### Game Events

#### `game:collectingStarted`

Roulette word collection phase started.

```typescript
socket.on('game:collectingStarted', (data) => {
  // data.timeLimit: number (seconds, usually 30)
  // data.minWords: number (minimum words needed)
  // data.playerCount: number
  // data.impostorCount: number (selected impostor count)
});
```

---

#### `game:wordCollected`

A word was collected (roulette mode).

```typescript
socket.on('game:wordCollected', (data) => {
  // data.count: number (total words collected)
});
```

---

#### `game:started`

Game has started.

```typescript
socket.on('game:started', (data) => {
  // data.word: string | null (null if you're the impostor)
  // data.isImpostor: boolean
  // data.turnOrder: string[] (player IDs in turn order)
  // data.mode: GameMode
  // data.impostorCount: number (total number of impostors)
});
```

---

#### `game:newRound`

New round started.

```typescript
socket.on('game:newRound', (data) => {
  // data.round: number
});
```

---

#### `game:votingStarted`

Voting phase started.

```typescript
socket.on('game:votingStarted', () => {
  // No payload
});
```

---

#### `game:ended`

Game has ended.

```typescript
socket.on('game:ended', (data) => {
  // data.winner: 'crew' | 'impostor'
  // data.impostorIds: string[] (all impostor player IDs)
  // data.word: string
});
```

---

### Voting Events

#### `vote:update`

Vote state updated (broadcast after each vote).

```typescript
socket.on('vote:update', (data) => {
  // data.votes: Record<string, string> (voterId → targetId)
  // data.twoThirdsReached: boolean
});
```

---

#### `vote:result`

Voting round completed.

```typescript
socket.on('vote:result', (data) => {
  // data.eliminated?: string (player ID if someone was eliminated)
  // data.wasImpostor?: boolean (if eliminated player was the impostor)
  // Both undefined if it was a tie
});
```

---

### Error Event

#### `error`

An error occurred.

```typescript
socket.on('error', (data) => {
  // data.code: string (error code)
  // data.message: string (human-readable message)
});
```

**Error Codes**:

| Code | Description |
|------|-------------|
| `ROOM_NOT_FOUND` | Room doesn't exist |
| `NOT_ADMIN` | Action requires admin privileges |
| `NOT_ENOUGH_PLAYERS` | Need at least 3 players |
| `GAME_ALREADY_STARTED` | Can't perform action during game |
| `INVALID_STATE` | Action not allowed in current state |
| `ALREADY_IN_ROOM` | Player is already in a room |
| `ALREADY_VOTED` | Player has already voted |
| `MAX_ROOMS_REACHED` | Server room limit reached |

---

## Type Definitions

### Player

```typescript
interface Player {
  id: string;
  displayName: string;
  isConnected: boolean;
  isEliminated: boolean;
  hasVoted: boolean;
  votedFor?: string;
}
```

### ClientRoom

```typescript
interface ClientRoom {
  id: string;
  code: string;
  adminId: string;
  status: 'lobby' | 'collecting_words' | 'playing' | 'voting' | 'finished';
  language: 'es' | 'en' | 'ca' | 'eu' | 'gl';
  players: Player[];
  currentWord?: string | null; // null for impostors
  turnOrder?: string[];
  currentRound: number;
  category?: string;
  winCondition?: 'impostor_caught' | 'impostor_survived';
  wordCount?: number; // roulette mode
}
```

> **Note**: `impostorIds` are not included in `ClientRoom` for security reasons. Players only know if they themselves are an impostor via `game:started`.

### GameMode

```typescript
type GameMode = 'classic' | 'random' | 'custom' | 'roulette';
```

### SupportedLanguage

```typescript
type SupportedLanguage = 'es' | 'en' | 'ca' | 'eu' | 'gl';
```

---

## Example: Complete Game Flow

```typescript
// 1. Connect
const socket = io(API_URL, { auth: { token } });

// 2. Create room
socket.emit('room:create', { language: 'en' });
socket.on('room:created', ({ code }) => {
  console.log('Room code:', code); // Share with friends
});

// 3. Wait for players to join
socket.on('room:playerJoined', (player) => {
  console.log(`${player.displayName} joined!`);
});

// 4. Start game (when 3+ players)
socket.emit('game:start', {
  mode: 'classic',
  category: 'animals',
  impostorCount: 1  // Or more for larger groups
});

// 5. Receive game state
socket.on('game:started', ({ word, isImpostor, impostorCount }) => {
  console.log(`Game started with ${impostorCount} impostor(s)`);
  if (isImpostor) {
    console.log("You're an impostor! Fake it!");
  } else {
    console.log('Secret word:', word);
  }
});

// 6. Play rounds (describe word in turns)
// 7. Start voting
socket.emit('game:startVoting');

// 8. Cast vote
socket.emit('vote:cast', { targetId: suspectId });

// 9. Watch votes come in
socket.on('vote:update', ({ votes, twoThirdsReached }) => {
  console.log('Votes:', votes);
});

// 10. Confirm vote (admin)
socket.emit('vote:confirm', { eliminate: true });

// 11. Check result
socket.on('vote:result', ({ eliminated, wasImpostor }) => {
  if (wasImpostor) {
    console.log('Impostor caught!');
  }
});

// 12. Game ends
socket.on('game:ended', ({ winner, impostorIds, word }) => {
  console.log(`${winner} wins! Word was: ${word}`);
  console.log(`Impostor(s) were: ${impostorIds.join(', ')}`);
});

// 13. Play again?
socket.emit('game:playAgain');
```
