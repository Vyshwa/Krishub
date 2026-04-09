import { useEffect, useRef } from 'react';

export function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];
    let mouse = { x: -1000, y: -1000, active: false };
    let waves = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const isDark = () => document.documentElement.classList.contains('dark');

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.baseSize = Math.random() * 2.5 + 1;
        this.size = this.baseSize;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.opacity = Math.random() * 0.6 + 0.2;
        this.pulseSpeed = Math.random() * 0.03 + 0.01;
        this.pulseOffset = Math.random() * Math.PI * 2;
        this.hue = 210 + Math.random() * 50; // blue-indigo range
        this.trail = [];
      }
      update(time) {
        // Store trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 5) this.trail.shift();

        this.x += this.vx;
        this.y += this.vy;

        // Mouse interaction — attract gently, repel when very close
        if (mouse.active) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200 && dist > 40) {
            // Gentle orbit attraction
            this.vx += (dx / dist) * 0.03;
            this.vy += (dy / dist) * 0.03;
          } else if (dist <= 40) {
            // Repel when too close
            this.vx -= (dx / dist) * 0.5;
            this.vy -= (dy / dist) * 0.5;
          }
          // Size boost near mouse
          this.size = this.baseSize + Math.max(0, (200 - dist) / 200) * 3;
        } else {
          this.size = this.baseSize;
        }

        // Dampen velocity
        this.vx *= 0.99;
        this.vy *= 0.99;

        // Pulse
        this.currentOpacity = this.opacity * (0.5 + 0.5 * Math.sin(time * this.pulseSpeed + this.pulseOffset));

        // Wrap
        if (this.x < -20) this.x = canvas.width + 20;
        if (this.x > canvas.width + 20) this.x = -20;
        if (this.y < -20) this.y = canvas.height + 20;
        if (this.y > canvas.height + 20) this.y = -20;
      }
      draw(ctx, dark) {
        // Draw trail
        if (this.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(this.trail[0].x, this.trail[0].y);
          for (let i = 1; i < this.trail.length; i++) {
            ctx.lineTo(this.trail[i].x, this.trail[i].y);
          }
          const sat = dark ? '80%' : '70%';
          const light = dark ? '60%' : '50%';
          ctx.strokeStyle = `hsla(${this.hue}, ${sat}, ${light}, ${this.currentOpacity * 0.3})`;
          ctx.lineWidth = this.size * 0.5;
          ctx.stroke();
        }

        // Glow
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 4);
        const sat = dark ? '80%' : '70%';
        const light = dark ? '65%' : '50%';
        gradient.addColorStop(0, `hsla(${this.hue}, ${sat}, ${light}, ${this.currentOpacity})`);
        gradient.addColorStop(0.4, `hsla(${this.hue}, ${sat}, ${light}, ${this.currentOpacity * 0.4})`);
        gradient.addColorStop(1, `hsla(${this.hue}, ${sat}, ${light}, 0)`);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 90%, ${dark ? '80%' : '60%'}, ${this.currentOpacity})`;
        ctx.fill();
      }
    }

    class Wave {
      constructor(y) {
        this.baseY = y;
        this.amplitude = 20 + Math.random() * 30;
        this.frequency = 0.002 + Math.random() * 0.003;
        this.speed = 0.0005 + Math.random() * 0.001;
        this.hue = 220 + Math.random() * 30;
        this.opacity = 0.04 + Math.random() * 0.06;
      }
      draw(ctx, time, dark) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        for (let x = 0; x <= canvas.width; x += 4) {
          const y = this.baseY +
            Math.sin(x * this.frequency + time * this.speed) * this.amplitude +
            Math.sin(x * this.frequency * 2.5 + time * this.speed * 1.5) * (this.amplitude * 0.3);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        const sat = dark ? '60%' : '50%';
        const light = dark ? '40%' : '60%';
        ctx.fillStyle = `hsla(${this.hue}, ${sat}, ${light}, ${this.opacity})`;
        ctx.fill();
      }
    }

    const initParticles = () => {
      const count = Math.min(Math.floor((canvas.width * canvas.height) / 8000), 150);
      particles = Array.from({ length: count }, () => new Particle());
    };

    const initWaves = () => {
      waves = [];
      for (let i = 0; i < 4; i++) {
        waves.push(new Wave(canvas.height * (0.5 + i * 0.15)));
      }
    };

    initParticles();
    initWaves();

    const drawConnections = (dark, time) => {
      const maxDist = 160;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < maxDist * maxDist) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / maxDist) * 0.25;
            const hue = (particles[i].hue + particles[j].hue) / 2;
            const sat = dark ? '70%' : '60%';
            const light = dark ? '60%' : '45%';
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `hsla(${hue}, ${sat}, ${light}, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
    };

    const drawMouseGlow = (dark) => {
      if (!mouse.active) return;
      const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 180);
      const baseHue = dark ? 240 : 220;
      gradient.addColorStop(0, `hsla(${baseHue}, 80%, ${dark ? '60%' : '50%'}, 0.12)`);
      gradient.addColorStop(0.5, `hsla(${baseHue}, 70%, ${dark ? '50%' : '40%'}, 0.04)`);
      gradient.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 180, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    };

    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dark = isDark();

      // Draw waves first (background)
      waves.forEach(w => w.draw(ctx, time, dark));

      // Mouse glow
      drawMouseGlow(dark);

      // Particles
      particles.forEach(p => {
        p.update(time);
        p.draw(ctx, dark);
      });
      drawConnections(dark, time);

      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);

    const handleMouse = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; };
    const handleTouch = (e) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    };
    const handleMouseLeave = () => { mouse.active = false; };
    const handleTouchEnd = () => { mouse.active = false; };
    // Use window for mouse tracking but canvas needs pointer-events for touch
    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouch, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    const handleResize = () => { resize(); initParticles(); initWaves(); };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouch);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
