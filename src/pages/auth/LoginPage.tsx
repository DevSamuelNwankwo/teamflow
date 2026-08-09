import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { loginSchema, type LoginFormValues } from '@/lib/validation/authSchema'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import { getReadableError } from '@/api/errors'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/app/dashboard'

  async function onSubmit(values: LoginFormValues) {
    setFormError(null)
    try {
      await login(values)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setFormError(getReadableError(error))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-sunken px-4">
      <div className="w-full max-w-sm rounded-card border border-border-default bg-surface p-8 shadow-card">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-control bg-brand-600 text-sm font-bold text-white">
            T
          </div>
          <span className="text-lg font-semibold text-text-primary">TeamFlow</span>
        </div>

        <h1 className="mb-1 text-xl font-semibold text-text-primary">Welcome back</h1>
        <p className="mb-6 text-sm text-text-secondary">Log in to manage your projects.</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <FormField label="Email" error={errors.email?.message} required>
            <Input type="email" autoComplete="email" placeholder="you@company.com" {...register('email')} />
          </FormField>

          <FormField label="Password" error={errors.password?.message} required>
            <Input type="password" autoComplete="current-password" placeholder="••••••••" {...register('password')} />
          </FormField>

          {formError && (
            <p role="alert" className="rounded-control bg-status-red-bg px-3 py-2 text-sm text-status-red-text">
              {formError}
            </p>
          )}

          <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
