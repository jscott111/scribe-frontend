import { useEffect, useRef } from 'react'

/**
 * Custom hook to prevent screen from dimming and turning off
 * Uses the Screen Wake Lock API (similar to YouTube, video players, etc.)
 * 
 * @param enabled - Whether the wake lock should be active
 */
export function useWakeLock(enabled: boolean = true) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    // Only request wake lock if enabled and API is available
    if (!enabled) {
      return
    }

    // Check if the Wake Lock API is supported
    if (!('wakeLock' in navigator)) {
      console.warn('⚠️ Screen Wake Lock API is not supported in this browser')
      return
    }

    // Request wake lock
    const requestWakeLock = async () => {
      try {
        const wakeLock = await navigator.wakeLock.request('screen')
        wakeLockRef.current = wakeLock
        console.log('✅ Screen wake lock activated')
        
        // Handle wake lock release (e.g., when user switches tabs or locks screen)
        wakeLock.addEventListener('release', () => {
          console.log('⚠️ Screen wake lock was released')
        })
      } catch (err: any) {
        // The wake lock request can fail for various reasons
        console.warn('⚠️ Failed to request wake lock:', err.message)
      }
    }

    requestWakeLock()

    // Re-request wake lock if it's released (e.g., when user switches back to tab)
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && wakeLockRef.current === null) {
        try {
          const wakeLock = await navigator.wakeLock.request('screen')
          wakeLockRef.current = wakeLock
          console.log('✅ Screen wake lock re-activated after visibility change')
        } catch (err: any) {
          console.warn('⚠️ Failed to re-request wake lock:', err.message)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup: release wake lock when component unmounts or enabled becomes false
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      
      if (wakeLockRef.current) {
        wakeLockRef.current.release().then(() => {
          console.log('✅ Screen wake lock released')
          wakeLockRef.current = null
        }).catch((err) => {
          console.warn('⚠️ Error releasing wake lock:', err)
        })
      }
    }
  }, [enabled])
}

