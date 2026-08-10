'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      if (process.env.NODE_ENV === 'production' && !window.location.hostname.includes('localhost')) {
        window.addEventListener('load', () => {
          navigator.serviceWorker
            .register('/sw.js')
            .then((reg) => {
              console.log('Alpona Service Worker registered with scope:', reg.scope)
            })
            .catch((err) => {
              console.warn('Alpona Service Worker registration failed:', err)
            })
        })
      } else {
        // Unregister service workers in development / localhost mode
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister()
          }
        })
      }
    }
  }, [])

  return null
}
