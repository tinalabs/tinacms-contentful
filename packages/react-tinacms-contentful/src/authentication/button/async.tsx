// TODO: Another copy-paste job from react-tinacms-github/src/components/AsyncButton.tsx
import React, { useCallback, useState } from 'react';
import { LoadingDots } from '@tinacms/react-forms';
import { Button } from '@tinacms/styles';

interface ButtonProps {
  name: string;
  action(): Promise<void>;
  primary: boolean;
}

export const AsyncButton = ({ name, primary, action }: ButtonProps) => {
  const [submitting, setSubmitting] = useState(false);

  const onClick = useCallback(async () => {
    setSubmitting(true);
    try {
      await action();
      setSubmitting(false);
    } catch (e) {
      setSubmitting(false);
      throw e;
    }
  }, [action, setSubmitting]);

  return (
    <Button
      primary={primary}
      onClick={onClick}
      busy={submitting}
      disabled={submitting}
    >
      {submitting && <LoadingDots />}
      {!submitting && name}
    </Button>
  );
};
