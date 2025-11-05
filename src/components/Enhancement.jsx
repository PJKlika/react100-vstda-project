import { useEffect, useCallback } from 'react';

/**
 * Custom hook for interactive effects
 * Use this in your React components to add life to your webapp!
 */
export function useInteractiveEffects() {
  
  // Initialize effects on mount
  useEffect(() => {
    // Create particles
    createParticles();
    
    // Cleanup on unmount
    return () => {
      document.querySelectorAll('.particle').forEach(p => p.remove());
    };
  }, []);

  // Create floating particles
  const createParticles = () => {
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      const size = Math.random() * 4 + 2;
      const startX = Math.random() * window.innerWidth;
      const startY = window.innerHeight + 20;
      const duration = Math.random() * 20 + 15;
      const delay = Math.random() * 5;

      particle.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: rgba(6, 182, 212, ${Math.random() * 0.5 + 0.3});
        border-radius: 50%;
        pointer-events: none;
        z-index: 1;
        left: ${startX}px;
        top: ${startY}px;
        box-shadow: 0 0 ${size * 3}px rgba(6, 182, 212, 0.5);
        animation: particle-float ${duration}s linear ${delay}s infinite;
      `;

      document.body.appendChild(particle);
    }
  };

  // Show confetti animation
  const celebrateWithConfetti = useCallback(() => {
    const colors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      const x = Math.random() * window.innerWidth;
      const rotation = Math.random() * 360;
      const duration = Math.random() * 3 + 2;
      
      confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${color};
        left: ${x}px;
        top: -20px;
        z-index: 10000;
        pointer-events: none;
        transform: rotate(${rotation}deg);
        animation: particle-float ${duration}s ease-out forwards;
      `;

      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), duration * 1000);
    }
  }, []);

  // Show toast notification
  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const toast = document.createElement('div');
    const colors = {
      info: '#06b6d4',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b'
    };

    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      background: rgba(30, 41, 59, 0.95);
      border: 1px solid ${colors[type]};
      border-left: 4px solid ${colors[type]};
      border-radius: 12px;
      color: white;
      font-weight: 600;
      z-index: 10001;
      backdrop-filter: blur(12px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3), 0 0 20px ${colors[type]}40;
      animation: slide-in-right 0.3s ease;
      max-width: 300px;
    `;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slide-in-left 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }, []);

  // Shake element animation
  const shakeElement = useCallback((element) => {
    if (!element) return;
    element.style.animation = 'shake 0.5s ease';
    setTimeout(() => {
      element.style.animation = '';
    }, 500);
  }, []);

  // Create sparkle effect
  const createSparkle = useCallback((x, y) => {
    const sparkle = document.createElement('div');
    const size = Math.random() * 10 + 5;
    
    sparkle.style.cssText = `
      position: fixed;
      width: ${size}px;
      height: ${size}px;
      background: linear-gradient(135deg, #06b6d4, #8b5cf6);
      border-radius: 50%;
      pointer-events: none;
      z-index: 10000;
      left: ${x - size / 2}px;
      top: ${y - size / 2}px;
      animation: sparkle 0.6s ease-out;
    `;

    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 600);
  }, []);

  // Play sound effect
  const playSound = useCallback((type) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      const sounds = {
        click: { frequency: 800, duration: 0.05 },
        hover: { frequency: 600, duration: 0.03 },
        success: { frequency: 1000, duration: 0.1 },
        delete: { frequency: 400, duration: 0.1 }
      };

      const sound = sounds[type] || sounds.click;
      
      oscillator.frequency.value = sound.frequency;
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + sound.duration);
    } catch (e) {
      console.warn('Audio not supported');
    }
  }, []);

  // Ripple effect on click
  const createRipple = useCallback((event) => {
    const button = event.currentTarget;
    const ripple = document.createElement('div');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      left: ${x}px;
      top: ${y}px;
      pointer-events: none;
      animation: ripple 0.6s ease-out;
    `;

    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  }, []);

  return {
    celebrateWithConfetti,
    showToast,
    shakeElement,
    createSparkle,
    playSound,
    createRipple
  };
}