import { toast } from 'sonner'

/** Thin wrapper so call sites never import sonner directly — keeps the toast library swappable
 *  and gives every success/error toast in the app a consistent voice. */
export const notify = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast(message),
}
