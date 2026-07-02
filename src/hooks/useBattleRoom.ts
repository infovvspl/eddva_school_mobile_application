import { useEffect, useState } from 'react';
import { battleService } from '../services/battle.service';
import { mapBattleRoom, type BattleRoomState } from '../utils/battleMappers';

export function useBattleRoom(
  battleId?: string,
  pollMs = 2500,
  myStudentId?: string,
): BattleRoomState | null {
  const [room, setRoom] = useState<BattleRoomState | null>(null);

  useEffect(() => {
    if (!battleId) {
      setRoom(null);
      return;
    }

    let cancelled = false;

    const poll = async () => {
      try {
        const { data } = await battleService.getRoom(battleId);
        if (!cancelled) setRoom(mapBattleRoom(data, myStudentId));
      } catch {
        /* keep last room state */
      }
    };

    poll();
    const timer = setInterval(poll, pollMs);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [battleId, pollMs, myStudentId]);

  return room;
}

export function extractBattleId(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined;
  const d = data as Record<string, unknown>;
  const nested = d.battle ?? d.room;
  if (nested && typeof nested === 'object') {
    const id = (nested as Record<string, unknown>).id;
    if (id) return String(id);
  }
  const id = d.battleId ?? d.id ?? d.roomId;
  return id ? String(id) : undefined;
}

export function extractRoomCode(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined;
  const d = data as Record<string, unknown>;
  const code = d.roomCode ?? d.code ?? (d.room as Record<string, unknown>)?.roomCode;
  return code ? String(code) : undefined;
}
