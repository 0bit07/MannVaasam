import { faqs as seedFaqs } from "../data"
import { useApiQuery } from "../lib/apiResource"
import type { Faq } from "../types"

export function useFaqs() {
  const { data, loading, error, reload } = useApiQuery<Faq[]>("/api/faqs", {
    initialData: seedFaqs,
    timeoutMessage: "FAQs took too long to load.",
    fallbackMessage: "Could not load FAQs.",
    fallbackData: () => seedFaqs,
  })

  return { faqs: data, loading, error, reload }
}
