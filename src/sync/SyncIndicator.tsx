/**
 * Small non-blocking sync indicator. F6.5 + N1.4: surface offline state
 * + conflict count without interrupting the user. Place at the top of
 * stack views or in headers.
 */

import { Stack, Text } from 'tamagui';

import { useSyncStore } from './store';

export function SyncIndicator() {
  const status = useSyncStore((s) => s.status);
  const pending = useSyncStore((s) => s.pendingCount);
  const conflicts = useSyncStore((s) => s.conflictCount);

  if (status === 'idle' && pending === 0 && conflicts === 0) return null;

  const [label, color] = labelFor(status, pending, conflicts);

  return (
    <Stack
      backgroundColor="$backgroundCard"
      borderColor={color}
      borderWidth={1}
      borderRadius="$pill"
      paddingHorizontal="$3"
      paddingVertical="$1"
      alignSelf="flex-start"
    >
      <Text color={color} fontSize={11} fontWeight="700" letterSpacing={1}>
        {label}
      </Text>
    </Stack>
  );
}

function labelFor(
  status: string,
  pending: number,
  conflicts: number,
): [string, string] {
  if (conflicts > 0) return [`SYNC ${conflicts} CONFLICT${conflicts > 1 ? 'S' : ''}`, '$tempMed'];
  if (status === 'offline') return ['OFFLINE', '$tempMed'];
  if (status === 'rate-limited') return ['THROTTLED', '$tempMed'];
  if (status === 'syncing') return ['SYNCING…', '$primary'];
  if (status === 'error') return ['SYNC ERROR', '$tempHigh'];
  if (pending > 0) return [`${pending} PENDING`, '$colorMuted'];
  return ['', '$colorMuted'];
}
