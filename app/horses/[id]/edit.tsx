import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { Text, YStack } from 'tamagui';

import { patchHorse as apiPatchHorse } from '@/api/horses';
import { getHorse, updateHorse as realmUpdateHorse } from '@/db/repositories/horses';
import {
  EMPTY_FORM,
  HorseForm,
  valuesToInput,
  type HorseFormValues,
} from '@/horses/HorseForm';

export default function EditHorseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const horseId = String(id);

  const [values, setValues] = useState<HorseFormValues>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await getHorse(horseId);
        if (cancelled) return;
        if (!raw) {
          setError('Horse not found.');
          return;
        }
        setValues(toForm(raw));
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Could not load the horse.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [horseId]);

  if (loading) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#0A1816' }}>
        <YStack padding="$5" gap="$3" alignItems="center">
          <ActivityIndicator color="#00DDA8" />
          <Text color="$colorSecondary" fontSize={13}>
            Loading horse…
          </Text>
        </YStack>
      </ScrollView>
    );
  }

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    const input = valuesToInput(values);
    try {
      await realmUpdateHorse(horseId, input);
    } catch (e) {
      setSubmitting(false);
      setError(e instanceof Error ? e.message : 'Could not update the horse locally.');
      return;
    }
    const apiRes = await apiPatchHorse(horseId, input);
    setSubmitting(false);
    if (!apiRes.ok && apiRes.code !== 'network' && apiRes.status !== 0) {
      setError(`Saved locally. Server sync failed: ${apiRes.message}`);
      return;
    }
    router.replace(`/horses/${horseId}`);
  };

  return (
    <HorseForm
      values={values}
      setValues={setValues}
      onSubmit={handleSubmit}
      submitting={submitting}
      submitLabel="Save changes"
      errorMessage={error}
    />
  );
}

function toForm(raw: unknown): HorseFormValues {
  const r = raw as Record<string, unknown>;
  const str = (v: unknown): string => (typeof v === 'string' ? v : '');
  const num = (v: unknown): string =>
    typeof v === 'number' && Number.isFinite(v) ? String(v) : '';
  return {
    name: str(r.name),
    breed: str(r.breed),
    heightHands: num(r.heightHands),
    weightLbs: num(r.weightLbs),
    age: num(r.age),
    sex: str(r.sex),
    color: str(r.color),
    uniqueMarkings: str(r.uniqueMarkings),
    discipline: str(r.discipline),
    ownerName: str(r.ownerName),
    trainerName: str(r.trainerName),
    contactInfo: str(r.contactInfo),
  };
}
