-- =============================================
-- Schema for Room Persistence (Clean Architecture)
-- Run this in your Supabase SQL Editor
-- =============================================

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  admin_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'lobby',
  current_word TEXT,
  impostor_id UUID,
  turn_order TEXT[],
  current_round INTEGER DEFAULT 0,
  category TEXT,
  win_condition TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW()
);

-- Room players table
CREATE TABLE IF NOT EXISTS room_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  is_connected BOOLEAN DEFAULT true,
  is_eliminated BOOLEAN DEFAULT false,
  has_voted BOOLEAN DEFAULT false,
  voted_for UUID,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_room_players_room ON room_players(room_id);
CREATE INDEX IF NOT EXISTS idx_room_players_user ON room_players(user_id);

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rooms
CREATE POLICY "Anyone can view rooms" ON rooms
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create rooms" ON rooms
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Room admin can update" ON rooms
  FOR UPDATE USING (admin_id = auth.uid());

CREATE POLICY "Room admin can delete" ON rooms
  FOR DELETE USING (admin_id = auth.uid());

-- RLS Policies for room_players
CREATE POLICY "Anyone can view room players" ON room_players
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join rooms" ON room_players
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Players can update their own record" ON room_players
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Players can leave rooms" ON room_players
  FOR DELETE USING (user_id = auth.uid());

-- Allow room admins to kick players
CREATE POLICY "Room admin can remove players" ON room_players
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM rooms
      WHERE rooms.id = room_players.room_id
      AND rooms.admin_id = auth.uid()
    )
  );

-- Enable Realtime (optional)
-- ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
-- ALTER PUBLICATION supabase_realtime ADD TABLE room_players;

-- =============================================
-- Verify tables were created
-- =============================================
SELECT 'rooms' as table_name, COUNT(*) as count FROM rooms
UNION ALL
SELECT 'room_players' as table_name, COUNT(*) as count FROM room_players;
