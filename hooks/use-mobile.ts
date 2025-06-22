import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  orientation: 'portrait' | 'landscape' | undefined
  touchDevice: boolean
  screenSize: {
    width: number
    height: number
  }
  deviceType: 'mobile' | 'tablet' | 'desktop'
  platform: 'ios' | 'android' | 'desktop' | 'unknown'
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // SSR protection - only run on client side
    if (typeof window === 'undefined') return;

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useDevice(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = React.useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    orientation: undefined,
    touchDevice: false,
    screenSize: { width: 0, height: 0 },
    deviceType: 'desktop',
    platform: 'unknown'
  })

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateDeviceInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      const isMobile = width < MOBILE_BREAKPOINT
      const isTablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT
      const isDesktop = width >= TABLET_BREAKPOINT

      const orientation = height > width ? 'portrait' : 'landscape'
      const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

      // Detect platform
      let platform: DeviceInfo['platform'] = 'unknown'
      const userAgent = navigator.userAgent.toLowerCase()
      if (/iphone|ipad|ipod/.test(userAgent)) {
        platform = 'ios'
      } else if (/android/.test(userAgent)) {
        platform = 'android'
      } else {
        platform = 'desktop'
      }

      const deviceType: DeviceInfo['deviceType'] = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        orientation,
        touchDevice,
        screenSize: { width, height },
        deviceType,
        platform
      })
    }

    // Initial call
    updateDeviceInfo()

    // Listen for resize and orientation changes
    const resizeListener = () => updateDeviceInfo()
    const orientationListener = () => setTimeout(updateDeviceInfo, 100) // Small delay for orientation change

    window.addEventListener('resize', resizeListener)
    window.addEventListener('orientationchange', orientationListener)

    return () => {
      window.removeEventListener('resize', resizeListener)
      window.removeEventListener('orientationchange', orientationListener)
    }
  }, [])

  return deviceInfo
}

// Convenience hook for checking if current device is touch-enabled
export function useTouchDevice() {
  const { touchDevice } = useDevice()
  return touchDevice
}

// Hook for checking safe area support (iOS notches, etc.)
export function useSafeArea() {
  const [safeArea, setSafeArea] = React.useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  })

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if CSS env() is supported
    const checkSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement)
      setSafeArea({
        top: parseInt(computedStyle.getPropertyValue('--sat') || '0') || 0,
        bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0') || 0,
        left: parseInt(computedStyle.getPropertyValue('--sal') || '0') || 0,
        right: parseInt(computedStyle.getPropertyValue('--sar') || '0') || 0,
      })
    }

    // Set CSS custom properties for safe areas
    const style = document.createElement('style')
    style.textContent = `
      :root {
        --sat: env(safe-area-inset-top);
        --sab: env(safe-area-inset-bottom);
        --sal: env(safe-area-inset-left);
        --sar: env(safe-area-inset-right);
      }
    `
    document.head.appendChild(style)

    checkSafeArea()

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return safeArea
}
