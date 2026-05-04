/**
 * HorseForm — used by both /horses/new and /horses/[id]/edit.
 *
 * F3.2 fields. Required (per F3.3): name, organizationId. Everything
 * else is optional. The discipline picker is the same set as the
 * profile-completion screen for consistency.
 */

import { ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { Input, Stack, Text, XStack, YStack } from 'tamagui';

const DISCIPLINES = [
  'Show jumping',
  'Dressage',
  'Eventing',
  'Hunter / equitation',
  'Western',
  'Trail / pleasure',
  'Endurance',
  'Racing',
  'Other',
];

const SEXES = ['Mare', 'Gelding', 'Stallion', 'Filly', 'Colt'];

export type HorseFormValues = {
  name: string;
  breed: string;
  heightHands: string;
  weightLbs: string;
  age: string;
  sex: string;
  color: string;
  uniqueMarkings: string;
  discipline: string;
  ownerName: string;
  trainerName: string;
  contactInfo: string;
};

export const EMPTY_FORM: HorseFormValues = {
  name: '',
  breed: '',
  heightHands: '',
  weightLbs: '',
  age: '',
  sex: '',
  color: '',
  uniqueMarkings: '',
  discipline: '',
  ownerName: '',
  trainerName: '',
  contactInfo: '',
};

export type HorseFormProps = {
  values: HorseFormValues;
  setValues: (v: HorseFormValues) => void;
  onSubmit: () => void;
  submitting: boolean;
  submitLabel: string;
  errorMessage?: string | null;
};

export function HorseForm({
  values,
  setValues,
  onSubmit,
  submitting,
  submitLabel,
  errorMessage,
}: HorseFormProps) {
  const set = <K extends keyof HorseFormValues>(k: K, v: string) =>
    setValues({ ...values, [k]: v });

  const isValid = values.name.trim().length > 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0A1816' }}
      keyboardShouldPersistTaps="handled"
    >
      <YStack padding="$5" gap="$5">
        <YStack gap="$3">
          <FieldLabel>Name (required)</FieldLabel>
          <Input
            value={values.name}
            onChangeText={(v) => set('name', v)}
            autoCapitalize="words"
            autoCorrect={false}
            placeholder="e.g. Buttercup"
            backgroundColor="$backgroundCard"
            borderColor="$borderColor"
            color="$color"
            placeholderTextColor="$colorMuted"
          />
        </YStack>

        <YStack gap="$3">
          <FieldLabel>Breed</FieldLabel>
          <Input
            value={values.breed}
            onChangeText={(v) => set('breed', v)}
            autoCapitalize="words"
            placeholder="e.g. Warmblood"
            backgroundColor="$backgroundCard"
            borderColor="$borderColor"
            color="$color"
            placeholderTextColor="$colorMuted"
          />
        </YStack>

        <XStack gap="$3">
          <YStack gap="$3" flex={1}>
            <FieldLabel>Height (hands)</FieldLabel>
            <Input
              value={values.heightHands}
              onChangeText={(v) => set('heightHands', v)}
              keyboardType="decimal-pad"
              placeholder="e.g. 16.2"
              backgroundColor="$backgroundCard"
              borderColor="$borderColor"
              color="$color"
              placeholderTextColor="$colorMuted"
            />
          </YStack>
          <YStack gap="$3" flex={1}>
            <FieldLabel>Weight (lbs)</FieldLabel>
            <Input
              value={values.weightLbs}
              onChangeText={(v) => set('weightLbs', v)}
              keyboardType="number-pad"
              placeholder="e.g. 1100"
              backgroundColor="$backgroundCard"
              borderColor="$borderColor"
              color="$color"
              placeholderTextColor="$colorMuted"
            />
          </YStack>
        </XStack>

        <XStack gap="$3">
          <YStack gap="$3" flex={1}>
            <FieldLabel>Age</FieldLabel>
            <Input
              value={values.age}
              onChangeText={(v) => set('age', v)}
              keyboardType="number-pad"
              placeholder="years"
              backgroundColor="$backgroundCard"
              borderColor="$borderColor"
              color="$color"
              placeholderTextColor="$colorMuted"
            />
          </YStack>
          <YStack gap="$3" flex={1}>
            <FieldLabel>Color</FieldLabel>
            <Input
              value={values.color}
              onChangeText={(v) => set('color', v)}
              autoCapitalize="words"
              placeholder="e.g. bay"
              backgroundColor="$backgroundCard"
              borderColor="$borderColor"
              color="$color"
              placeholderTextColor="$colorMuted"
            />
          </YStack>
        </XStack>

        <YStack gap="$3">
          <FieldLabel>Sex</FieldLabel>
          <PillRow
            options={SEXES}
            value={values.sex}
            onChange={(v) => set('sex', v)}
          />
        </YStack>

        <YStack gap="$3">
          <FieldLabel>Discipline</FieldLabel>
          <PillRow
            options={DISCIPLINES}
            value={values.discipline}
            onChange={(v) => set('discipline', v)}
          />
        </YStack>

        <YStack gap="$3">
          <FieldLabel>Unique markings</FieldLabel>
          <Input
            value={values.uniqueMarkings}
            onChangeText={(v) => set('uniqueMarkings', v)}
            autoCapitalize="sentences"
            placeholder="white blaze, sock on right hind…"
            multiline
            numberOfLines={2}
            backgroundColor="$backgroundCard"
            borderColor="$borderColor"
            color="$color"
            placeholderTextColor="$colorMuted"
          />
        </YStack>

        <YStack gap="$3">
          <FieldLabel>Owner</FieldLabel>
          <Input
            value={values.ownerName}
            onChangeText={(v) => set('ownerName', v)}
            autoCapitalize="words"
            placeholder="Owner name"
            backgroundColor="$backgroundCard"
            borderColor="$borderColor"
            color="$color"
            placeholderTextColor="$colorMuted"
          />
        </YStack>

        <YStack gap="$3">
          <FieldLabel>Trainer</FieldLabel>
          <Input
            value={values.trainerName}
            onChangeText={(v) => set('trainerName', v)}
            autoCapitalize="words"
            placeholder="Trainer name"
            backgroundColor="$backgroundCard"
            borderColor="$borderColor"
            color="$color"
            placeholderTextColor="$colorMuted"
          />
        </YStack>

        <YStack gap="$3">
          <FieldLabel>Contact info</FieldLabel>
          <Input
            value={values.contactInfo}
            onChangeText={(v) => set('contactInfo', v)}
            placeholder="phone or email"
            keyboardType="email-address"
            autoCapitalize="none"
            backgroundColor="$backgroundCard"
            borderColor="$borderColor"
            color="$color"
            placeholderTextColor="$colorMuted"
          />
        </YStack>

        {errorMessage && (
          <Stack backgroundColor="#3A1F1F" borderRadius="$md" padding="$3">
            <Text color="#FF8A8A" fontSize={13}>
              {errorMessage}
            </Text>
          </Stack>
        )}

        <Pressable
          accessibilityRole="button"
          onPress={onSubmit}
          disabled={!isValid || submitting}
          hitSlop={8}
          style={{ opacity: !isValid || submitting ? 0.4 : 1 }}
        >
          <Stack
            backgroundColor="$primary"
            borderRadius="$pill"
            paddingVertical="$4"
            paddingHorizontal="$5"
            alignItems="center"
            justifyContent="center"
            minHeight={52}
          >
            {submitting ? (
              <ActivityIndicator color="#0A1816" />
            ) : (
              <Text color="#0A1816" fontSize={15} fontWeight="700">
                {submitLabel}
              </Text>
            )}
          </Stack>
        </Pressable>

        <Stack height={48} />
      </YStack>
    </ScrollView>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text color="$color" fontSize={13} fontWeight="600" letterSpacing={0.4}>
      {children}
    </Text>
  );
}

function PillRow({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <XStack gap="$2">
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <Pressable
              key={opt}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => onChange(selected ? '' : opt)}
              hitSlop={8}
            >
              <Stack
                backgroundColor={selected ? '$primary' : '$backgroundCard'}
                borderColor={selected ? '$primary' : '$borderColor'}
                borderWidth={1}
                borderRadius="$pill"
                paddingHorizontal="$4"
                paddingVertical="$3"
                minHeight={44}
                alignItems="center"
                justifyContent="center"
              >
                <Text
                  color={selected ? '#0A1816' : '$color'}
                  fontSize={13}
                  fontWeight="600"
                >
                  {opt}
                </Text>
              </Stack>
            </Pressable>
          );
        })}
      </XStack>
    </ScrollView>
  );
}

export function valuesToInput(values: HorseFormValues): {
  name: string;
  breed?: string;
  heightHands?: number;
  weightLbs?: number;
  age?: number;
  sex?: string;
  color?: string;
  uniqueMarkings?: string;
  discipline?: string;
  ownerName?: string;
  trainerName?: string;
  contactInfo?: string;
} {
  const num = (v: string): number | undefined => {
    const n = Number(v);
    return Number.isFinite(n) && v.trim().length > 0 ? n : undefined;
  };
  const str = (v: string): string | undefined =>
    v.trim().length > 0 ? v.trim() : undefined;
  return {
    name: values.name.trim(),
    breed: str(values.breed),
    heightHands: num(values.heightHands),
    weightLbs: num(values.weightLbs),
    age: num(values.age),
    sex: str(values.sex),
    color: str(values.color),
    uniqueMarkings: str(values.uniqueMarkings),
    discipline: str(values.discipline),
    ownerName: str(values.ownerName),
    trainerName: str(values.trainerName),
    contactInfo: str(values.contactInfo),
  };
}
