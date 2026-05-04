/**
 * BluetoothRequired — interstitial that any scan-flow screen can render
 * when BLE isn't available. Per F1.2 + F5.1, includes a Settings deep link.
 *
 * Variants:
 *   - status === 'denied' → "Allow Bluetooth" CTA opens the prompt.
 *   - status === 'blocked' → "Open Settings" CTA opens the system settings.
 *   - status === 'powered-off' → "Turn on Bluetooth" with Settings deep link.
 *   - status === 'unsupported' → static message; no CTA.
 *
 * Color is paired with copy + icon shape per constitution N5.3 (color is
 * never the only carrier of meaning).
 */

import { ActivityIndicator, Pressable } from 'react-native';
import { Stack, Text, XStack, YStack } from 'tamagui';

import {
  openAppSettings,
  type BlePermissionStatus,
  useBleStore,
} from './index';

type BluetoothRequiredProps = {
  status: BlePermissionStatus | 'unknown';
  onProceed?: () => void;
};

export function BluetoothRequired({ status, onProceed }: BluetoothRequiredProps) {
  const request = useBleStore((s) => s.request);

  const [title, body, ctaLabel, ctaAction] = copyFor(status, request);

  return (
    <YStack
      flex={1}
      backgroundColor="$background"
      padding="$5"
      gap="$5"
      justifyContent="center"
    >
      <YStack gap="$3" alignItems="flex-start">
        <Stack
          width={48}
          height={48}
          borderRadius="$round"
          backgroundColor="$tempMed"
          alignItems="center"
          justifyContent="center"
        >
          <Text color="#0A1816" fontSize={24} fontWeight="700">
            !
          </Text>
        </Stack>
        <Text color="$color" fontSize={26} fontWeight="700">
          {title}
        </Text>
        <Text color="$colorSecondary" fontSize={15} lineHeight={22}>
          {body}
        </Text>
      </YStack>

      {ctaLabel && (
        <CtaButton label={ctaLabel} onPress={ctaAction ?? (() => {})} />
      )}

      {status === 'unknown' && (
        <XStack gap="$2" alignItems="center">
          <ActivityIndicator color="#00DDA8" />
          <Text color="$colorSecondary" fontSize={13}>
            Checking Bluetooth status…
          </Text>
        </XStack>
      )}

      {status === 'granted' && onProceed && (
        <CtaButton label="Continue" onPress={onProceed} />
      )}
    </YStack>
  );
}

function copyFor(
  status: BlePermissionStatus | 'unknown',
  request: () => Promise<BlePermissionStatus>,
): [string, string, string | null, (() => void) | null] {
  switch (status) {
    case 'denied':
      return [
        'Bluetooth required',
        'B-Sure connects to your Smart Boot over Bluetooth to capture each scan. Allow Bluetooth so we can find the boot.',
        'Allow Bluetooth',
        () => {
          void request();
        },
      ];
    case 'blocked':
      return [
        'Bluetooth was turned off for B-Sure',
        'Open Settings → B-Sure → Bluetooth and switch it on, then come back.',
        'Open Settings',
        () => {
          void openAppSettings();
        },
      ];
    case 'powered-off':
      return [
        'Turn on Bluetooth',
        'Bluetooth is off on this device. Turn it on in Control Center or Settings, then come back to keep scanning.',
        'Open Settings',
        () => {
          void openAppSettings();
        },
      ];
    case 'unsupported':
      return [
        'This device cannot connect to a Smart Boot',
        'B-Sure needs Bluetooth Low Energy. This simulator/device does not have a BLE radio. Scans will sync from a real device.',
        null,
        null,
      ];
    case 'granted':
      return [
        "You're all set",
        'Bluetooth is ready — pair a Smart Boot or start a scan.',
        null,
        null,
      ];
    case 'unknown':
    default:
      return ['Checking Bluetooth…', 'One sec.', null, null];
  }
}

function CtaButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8}>
      <Stack
        backgroundColor="$primary"
        borderRadius="$pill"
        paddingVertical="$4"
        paddingHorizontal="$5"
        alignItems="center"
        justifyContent="center"
        minHeight={52}
      >
        <Text color="#0A1816" fontSize={15} fontWeight="700">
          {label}
        </Text>
      </Stack>
    </Pressable>
  );
}
