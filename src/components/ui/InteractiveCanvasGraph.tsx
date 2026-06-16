'use client';

import React, { useRef, useEffect } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  label?: string;
  isMain?: boolean;
  baseX: number;
  baseY: number;
}

export default function InteractiveCanvasGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let nodes: Node[] = [];

    const mainLabels = [
      'Science',
      'Engineering',
      'Research',
      'Manufacturing',
      'Business',
      'AI',
      'Innovation'
    ];

    const resize = () => {
      const container = containerRef.current;
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width;
      canvas.height = height;

      // Seed nodes
      nodes = [];

      // Main labeled nodes (centered geometrically in circular pattern)
      const cx = width / 2;
      const cy = height / 2;
      const r = Math.min(width, height) * 0.28;

      mainLabels.forEach((label, i) => {
        const angle = (i * 2 * Math.PI) / mainLabels.length;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        nodes.push({
          x,
          y,
          vx: 0,
          vy: 0,
          radius: 6,
          label,
          isMain: true,
          baseX: x,
          baseY: y
        });
      });

      // Ambient nodes
      const ambientCount = Math.min(45, Math.floor((width * height) / 20000));
      for (let i = 0; i < ambientCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        nodes.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 2 + 1,
          isMain: false,
          baseX: x,
          baseY: y
        });
      }
    };

    resize();
    window.addEventListener('resize', resize);

    // Track mouse
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;

      // Update positions
      nodes.forEach(node => {
        if (node.isMain) {
          // Spring mechanics back to base position
          const dx = node.baseX - node.x;
          const dy = node.baseY - node.y;
          node.vx += dx * 0.03;
          node.vy += dy * 0.03;
          node.vx *= 0.82;
          node.vy *= 0.82;
        }

        // Mouse interaction (repulsion/attraction)
        if (mouse.active) {
          const mdx = mouse.x - node.x;
          const mdy = mouse.y - node.y;
          const dist = Math.sqrt(mdx * mdx + mdy * mdy);
          const forceRadius = 160;

          if (dist < forceRadius) {
            const force = (forceRadius - dist) / forceRadius;
            if (node.isMain) {
              // Main nodes react elastically by moving away slightly
              node.vx -= (mdx / dist) * force * 1.5;
              node.vy -= (mdy / dist) * force * 1.5;
            } else {
              // Ambient nodes get pulled or pushed slightly
              node.vx -= (mdx / dist) * force * 0.2;
              node.vy -= (mdy / dist) * force * 0.2;
            }
          }
        }

        node.x += node.vx;
        node.y += node.vy;

        // Boundary checks for ambient nodes
        if (!node.isMain) {
          if (node.x < 0 || node.x > width) node.vx *= -1;
          if (node.y < 0 || node.y > height) node.vy *= -1;
        }
      });

      // Draw connections
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const connectionLimit = n1.isMain && n2.isMain ? 220 : 110;

          if (dist < connectionLimit) {
            const alpha = (connectionLimit - dist) / connectionLimit;
            ctx.strokeStyle = n1.isMain && n2.isMain 
              ? `rgba(212, 160, 23, ${alpha * 0.45})` // Premium Gold for main connections
              : `rgba(0, 109, 119, ${alpha * 0.25})`; // Deep Teal for ambient connections
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes & labels
      nodes.forEach(node => {
        if (node.isMain) {
          // Draw outer glowing halo
          ctx.beginPath();
          ctx.arc(node.x, node.y, 16, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(212, 160, 23, 0.05)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(212, 160, 23, 0.15)';
          ctx.fill();

          // Core node dot
          ctx.beginPath();
          ctx.arc(node.x, node.y, 3.5, 0, 2 * Math.PI);
          ctx.fillStyle = '#D4A017';
          ctx.fill();

          // Label typography
          if (node.label) {
            ctx.font = 'bold 9px monospace';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.label.toUpperCase(), node.x, node.y - 18);
          }
        } else {
          // Ambient dot
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.fill();
        }
      });

      // Draw connection lines to mouse
      if (mouse.active) {
        nodes.forEach(node => {
          if (node.isMain) {
            const dx = mouse.x - node.x;
            const dy = mouse.y - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 180) {
              const alpha = (180 - dist) / 180;
              ctx.strokeStyle = `rgba(212, 160, 23, ${alpha * 0.3})`;
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.stroke();
            }
          }
        });
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-auto">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
