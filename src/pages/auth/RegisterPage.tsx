import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { registerSchema, type RegisterFormValues } from '@/lib/validation/authSchema'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import { getReadableError } from '@/api/errors'
import { notify } from '@/lib/toast'

export function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmationSent, setConfirmationSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) })

  async function onSubmit(values: RegisterFormValues) {
    setFormError(null)
    try {
      const hasSession = await registerUser(values)
      if (hasSession) {
        notify.success(`Welcome to TeamFlow, ${values.name.split(' ')[0]}!`)
        navigate('/app/dashboard', { replace: true })
      } else {
        // This Supabase project requires email confirmation before a session is issued.
        setConfirmationSent(true)
      }
    } catch (error) {
      setFormError(getReadableError(error))
    }
  }

  if (confirmationSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-sunken px-4">
        <div className="w-full max-w-sm rounded-card border border-border-default bg-surface p-8 text-center shadow-card">
          <h1 className="mb-2 text-xl font-semibold text-text-primary">Check your email</h1>
          <p className="mb-6 text-sm text-text-secondary">
            We&apos;ve sent a confirmation link to your inbox. Click it to activate your account, then log in.
          </p>
          <Link to="/login">
            <Button className="w-full">Back to log in</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-sunken px-4 py-8">
      <div className="w-full max-w-sm rounded-card border border-border-default bg-surface p-8 shadow-card">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-control bg-brand-600 text-sm font-bold text-white">
            T
          </div>
          <span className="text-lg font-semibold text-text-primary">TeamFlow</span>
        </div>

        <h1 className="mb-1 text-xl font-semibold text-text-primary">Create your account</h1>
        <p className="mb-6 text-sm text-text-secondary">Start organizing your team&apos;s work.</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <FormField label="Full name" error={errors.name?.message} required>
            <Input autoComplete="name" placeholder="Jane Doe" {...register('name')} />
          </FormField>

          <FormField label="Email" error={errors.email?.message} required>
            <Input type="email" autoComplete="email" placeholder="you@company.com" {...register('email')} />
          </FormField>

          <FormField label="Password" error={errors.password?.message} required hint="At least 8 characters">
            <Input type="password" autoComplete="new-password" placeholder="••••••••" {...register('password')} />
          </FormField>

          <FormField label="Confirm password" error={errors.confirmPassword?.message} required>
            <Input type="password" autoComplete="new-password" placeholder="••••••••" {...register('confirmPassword')} />
          </FormField>

          {formError && (
            <p role="alert" className="rounded-control bg-status-red-bg px-3 py-2 text-sm text-status-red-text">
              {formError}
            </p>
          )}

          <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
