/**
 * Haptic Feedback Utility for Mobile Devices
 * Provides standardized haptic feedback patterns with permission-based activation
 */

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection' | 'impact'

export interface HapticOptions {
  intensity?: number // 0-1 scale
  duration?: number // in milliseconds
  pattern?: number[] // Custom vibration pattern
}

class HapticManager {
  private isSupported = false
  private isEnabled = true
  private hasPermission = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.checkSupport()
      this.checkPermission()
    }
  }

  private checkSupport() {
    // Check for various vibration API support
    this.isSupported = !!(
      navigator?.vibrate ||
      (navigator as any)?.webkitVibrate ||
      (navigator as any)?.mozVibrate ||
      (navigator as any)?.msVibrate ||
      // Modern Vibration API
      'vibrate' in navigator
    )
  }

  private async checkPermission() {
    // For now, we assume permission is granted for vibration
    // In the future, we might need to check for specific permissions
    this.hasPermission = this.isSupported
  }

  /**
   * Check if haptic feedback is available and enabled
   */
  isAvailable(): boolean {
    return this.isSupported && this.isEnabled && this.hasPermission
  }

  /**
   * Enable or disable haptic feedback
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
    // Store preference in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('haptics-enabled', JSON.stringify(enabled))
    }
  }

  /**
   * Get haptic enabled preference from localStorage
   */
  private getStoredPreference(): boolean {
    if (typeof window === 'undefined') return true

    try {
      const stored = localStorage.getItem('haptics-enabled')
      return stored ? JSON.parse(stored) : true
    } catch {
      return true
    }
  }

  /**
   * Trigger haptic feedback with predefined patterns
   */
  trigger(pattern: HapticPattern, options?: HapticOptions): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.isAvailable()) {
        resolve(false)
        return
      }

      try {
        let vibrationPattern: number | number[]

        // Define haptic patterns
        switch (pattern) {
          case 'light':
            vibrationPattern = 10
            break
          case 'medium':
            vibrationPattern = 25
            break
          case 'heavy':
            vibrationPattern = 50
            break
          case 'success':
            vibrationPattern = [10, 50, 10] // Short-pause-short
            break
          case 'warning':
            vibrationPattern = [25, 100, 25, 100, 25] // Triple tap
            break
          case 'error':
            vibrationPattern = [100, 50, 100] // Strong double tap
            break
          case 'selection':
            vibrationPattern = 5 // Very light for selections
            break
          case 'impact':
            vibrationPattern = 15 // Quick impact
            break
          default:
            vibrationPattern = options?.pattern || 20
        }

        // Apply custom options
        if (options?.duration && typeof vibrationPattern === 'number') {
          vibrationPattern = options.duration
        }

        if (options?.intensity && typeof vibrationPattern === 'number') {
          vibrationPattern = Math.round(vibrationPattern * options.intensity)
        }

        // Trigger vibration
        const success = navigator.vibrate(vibrationPattern)
        resolve(success !== false)
      } catch (error) {
        console.warn('Haptic feedback failed:', error)
        resolve(false)
      }
    })
  }

  /**
   * Trigger custom vibration pattern
   */
  custom(pattern: number | number[]): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.isAvailable()) {
        resolve(false)
        return
      }

      try {
        const success = navigator.vibrate(pattern)
        resolve(success !== false)
      } catch (error) {
        console.warn('Custom haptic feedback failed:', error)
        resolve(false)
      }
    })
  }

  /**
   * Stop ongoing vibration
   */
  stop(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.isSupported) {
        resolve(false)
        return
      }

      try {
        const success = navigator.vibrate(0)
        resolve(success !== false)
      } catch (error) {
        console.warn('Stop haptic feedback failed:', error)
        resolve(false)
      }
    })
  }

  /**
   * Initialize haptic manager with stored preferences
   */
  init() {
    this.isEnabled = this.getStoredPreference()
    this.checkSupport()
    this.checkPermission()
  }
}

// Create singleton instance
const hapticManager = new HapticManager()

// Initialize on import
if (typeof window !== 'undefined') {
  hapticManager.init()
}

// Export convenience functions
export const haptics = {
  /**
   * Check if haptic feedback is available
   */
  isAvailable: () => hapticManager.isAvailable(),

  /**
   * Enable or disable haptic feedback
   */
  setEnabled: (enabled: boolean) => hapticManager.setEnabled(enabled),

  /**
   * Light haptic feedback (for button taps, selections)
   */
  light: (options?: HapticOptions) => hapticManager.trigger('light', options),

  /**
   * Medium haptic feedback (for confirmations, toggles)
   */
  medium: (options?: HapticOptions) => hapticManager.trigger('medium', options),

  /**
   * Heavy haptic feedback (for important actions)
   */
  heavy: (options?: HapticOptions) => hapticManager.trigger('heavy', options),

  /**
   * Success haptic feedback (for completed actions)
   */
  success: (options?: HapticOptions) => hapticManager.trigger('success', options),

  /**
   * Warning haptic feedback (for warnings, alerts)
   */
  warning: (options?: HapticOptions) => hapticManager.trigger('warning', options),

  /**
   * Error haptic feedback (for errors, failures)
   */
  error: (options?: HapticOptions) => hapticManager.trigger('error', options),

  /**
   * Selection haptic feedback (for list selections, swipes)
   */
  selection: (options?: HapticOptions) => hapticManager.trigger('selection', options),

  /**
   * Impact haptic feedback (for collisions, impacts)
   */
  impact: (options?: HapticOptions) => hapticManager.trigger('impact', options),

  /**
   * Custom haptic pattern
   */
  custom: (pattern: number | number[]) => hapticManager.custom(pattern),

  /**
   * Stop all haptic feedback
   */
  stop: () => hapticManager.stop(),
}

// React hook for haptic feedback
export function useHaptics() {
  return {
    haptics,
    isAvailable: haptics.isAvailable(),
    setEnabled: haptics.setEnabled,
  }
}

export default haptics
