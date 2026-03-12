'use client'

import { useEffect } from 'react'

/**
 * Evita Runtime TypeError: "Failed to execute 'measure' on 'Performance':
 * 'RootNotFound' cannot have a negative time stamp" (bug conhecido Next.js em dev).
 * Faz patch de performance.measure para ignorar esse erro.
 */
export default function PerformanceMeasureGuard() {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.performance?.measure) return
    const original = window.performance.measure.bind(window.performance)
    window.performance.measure = function measure(
      name: string,
      startOrMeasureOptions?: string | PerformanceMeasureOptions,
      endMark?: string
    ): PerformanceMeasure {
      try {
        if (arguments.length === 1) {
          return original(name) as PerformanceMeasure
        }
        if (typeof endMark === 'string') {
          return original(name, startOrMeasureOptions as string, endMark) as PerformanceMeasure
        }
        return original(name, startOrMeasureOptions as PerformanceMeasureOptions) as PerformanceMeasure
      } catch (err) {
        if (
          err instanceof TypeError &&
          (String((err as Error).message).includes('negative time stamp') ||
            String((err as Error).message).includes('RootNotFound') ||
            String((err as Error).message).includes('NotFound'))
        ) {
          return undefined as unknown as PerformanceMeasure
        }
        throw err
      }
    }
    return () => {
      window.performance.measure = original
    }
  }, [])
  return null
}
