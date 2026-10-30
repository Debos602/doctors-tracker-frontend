'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, Input, errorProps } from '@/components/ui/input';
import { loginSchema, type LoginValues } from '@/lib/validations';

const ERRORS: Record<string, string> = {
  INVALID_CREDENTIALS: 'That email and password don’t match an account.',
  RATE_LIMITED: 'Too many attempts. Wait 15 minutes, then try again.',
  BACKEND_UNREACHABLE: 'Can’t reach the Doctor Tracker server. Check that the API is running, then try again.',
  VALIDATION_ERROR: 'Check the email address and try again.',
};

const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL;
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD;

/** Only same-site paths, so the login page can't be used as an open redirect. */
function safeCallback(value: string | null) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard';
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const expired = searchParams.get('reason') === 'expired';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const result = await signIn('credentials', { ...values, redirect: false });
    if (!result || result.error) {
      setFormError(ERRORS[result?.error ?? ''] ?? 'Sign-in failed. Try again in a moment.');
      return;
    }
    router.replace(safeCallback(searchParams.get('callbackUrl')));
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      {(formError || expired) && (
        <div role="alert" className={formError ? 'rounded-lg border border-danger/30 bg-danger-soft px-3.5 py-3 text-sm text-ink' : 'rounded-lg border border-line bg-surface-2 px-3.5 py-3 text-sm text-ink-2'}>
          {formError ?? 'Your session ended. Sign in again to continue.'}
        </div>
      )}

      <Field label="Email" htmlFor="email" error={errors.email?.message}>
        <Input type="email" autoComplete="username" autoFocus {...register('email')} {...errorProps('email', errors.email?.message)} />
      </Field>

      <Field label="Password" htmlFor="password" error={errors.password?.message}>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className="pr-11"
            {...register('password')}
            {...errorProps('password', errors.password?.message)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-ink"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>

      <Button type="submit" loading={isSubmitting} className="h-11 w-full justify-center">
        Sign in
      </Button>

      {DEMO_EMAIL && DEMO_PASSWORD && (
        <div className="flex items-start gap-3 rounded-lg border border-dashed border-line-strong px-3.5 py-3 text-sm">
          <Info className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
          <div className="min-w-0 flex-1 text-ink-2">
            Demo admin: <span className="font-medium text-ink">{DEMO_EMAIL}</span>
          </div>
          <button
            type="button"
            className="shrink-0 font-medium text-primary hover:underline"
            onClick={() => {
              setValue('email', DEMO_EMAIL, { shouldValidate: true });
              setValue('password', DEMO_PASSWORD, { shouldValidate: true });
            }}
          >
            Fill in
          </button>
        </div>
      )}
    </form>
  );
}
