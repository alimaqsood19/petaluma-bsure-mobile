import { router } from 'expo-router';
import { useState } from 'react';

import { createHorse as apiCreateHorse } from '@/api/horses';
import { useAuthStore } from '@/auth';
import { createHorse as realmCreateHorse } from '@/db/repositories/horses';
import {
  EMPTY_FORM,
  HorseForm,
  valuesToInput,
  type HorseFormValues,
} from '@/horses/HorseForm';

export default function NewHorseScreen() {
  const memberships = useAuthStore((s) => s.memberships);
  const orgId = memberships[0]?.organizationId;

  const [values, setValues] = useState<HorseFormValues>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!orgId) {
      setError('No barn yet — finish profile completion first.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const input = valuesToInput(values);

    try {
      await realmCreateHorse({ organizationId: orgId, ...input });
    } catch (e) {
      setSubmitting(false);
      setError(e instanceof Error ? e.message : 'Could not save the horse locally.');
      return;
    }

    const apiRes = await apiCreateHorse({ organizationId: orgId, ...input });
    setSubmitting(false);
    if (!apiRes.ok && apiRes.code !== 'network' && apiRes.status !== 0) {
      // Local save already succeeded — surface the API error but proceed.
      setError(`Saved locally. Server sync failed: ${apiRes.message}`);
      return;
    }
    router.replace('/');
  };

  return (
    <HorseForm
      values={values}
      setValues={setValues}
      onSubmit={handleSubmit}
      submitting={submitting}
      submitLabel="Save horse"
      errorMessage={error}
    />
  );
}
