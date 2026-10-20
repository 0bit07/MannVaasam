import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react"
import { abortAfter, apiFetch, ApiError } from "./api"

export type ApiErrorMessages = {
  /** Shown when the request was aborted for taking too long. */
  timeout?: string
  /** Shown for any failure that isn't a recognised API/abort error. */
  fallback?: string
}

/**
 * Turns anything thrown by `apiFetch` (or an aborted fetch) into a single,
 * user-friendly message. Centralising this means every hook and admin panel
 * reports errors the same way instead of repeating the same try/catch
 * three-way check everywhere a request is made.
 */
export function describeApiError(
  error: unknown,
  messages: ApiErrorMessages = {},
): string {
  if (error instanceof DOMException && error.name === "AbortError") {
    return messages.timeout ?? "The request took too long. Please try again."
  }
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return messages.fallback ?? "Something went wrong. Please try again."
}

type UseApiQueryOptions<T,> = {
  /** Value shown while the first request is in flight. */
  initialData: T
  /** Abort the request after this many ms (default 5000). */
  timeoutMs?: number
  timeoutMessage?: string
  fallbackMessage?: string
  /**
   * Factory for the value to switch to when the request fails, instead of
   * leaving stale/initial data in place. A factory (rather than a plain
   * value) so it can read e.g. localStorage at the time of the failure.
   */
  fallbackData?: () => T
  /** Set to false to skip fetching, e.g. while a prerequisite isn't ready. */
  enabled?: boolean
}

export type UseApiQueryResult<T,> = {
  data: T
  loading: boolean
  error: string | null
  reload: () => void
  setData: Dispatch<SetStateAction<T>>
  setError: Dispatch<SetStateAction<string | null>>
}

/**
 * Shared GET-request hook: every call gets the same try/catch, timeout,
 * loading and error handling instead of each hook re-implementing it.
 */
export function useApiQuery<T>(
  path: string,
  options: UseApiQueryOptions<T>,
): UseApiQueryResult<T> {
  const {
    initialData,
    timeoutMs = 5000,
    timeoutMessage,
    fallbackMessage,
    fallbackData,
    enabled = true,
  } = options

  const [data, setData] = useState<T>(initialData)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!enabled) return Promise.resolve()
    setLoading(true)
    setError(null)
    const timeout = abortAfter(timeoutMs)
    return apiFetch<T>(path, { signal: timeout.signal })
      .then((result) => setData(result))
      .catch((err) => {
        setError(
          describeApiError(err, {
            timeout: timeoutMessage,
            fallback: fallbackMessage,
          }),
        )
        if (fallbackData) {
          setData(fallbackData())
        }
      })
      .finally(() => {
        timeout.cancel()
        setLoading(false)
      })
    // path/timeoutMs/enabled fully describe when a reload is needed; the
    // message/fallback options are static per-call-site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, timeoutMs, enabled])

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, error, reload: load, setData, setError }
}

export type UseApiMutationResult<Args extends unknown[],
Result,> = {
  run: (...args: Args) => Promise<Result>
  loading: boolean
  error: string | null
  clearError: () => void
}

/**
 * Shared mutation hook (POST/PUT/DELETE): wraps any async action in the same
 * try/catch/loading/error flow used by the query hook above.
 */
export function useApiMutation<Args extends unknown[], Result>(
  action: (...args: Args) => Promise<Result>,
  messages: ApiErrorMessages = {},
): UseApiMutationResult<Args, Result> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(
    async (...args: Args) => {
      setLoading(true)
      setError(null)
      try {
        return await action(...args)
      } catch (err) {
        setError(describeApiError(err, messages))
        throw err
      } finally {
        setLoading(false)
      }
    },
    // `action` and `messages` are expected to be stable per call-site
    // (defined once in the component/hook body).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [action],
  )

  return { run, loading, error, clearError: () => setError(null) }
}
