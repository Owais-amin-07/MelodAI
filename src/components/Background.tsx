import React, { useEffect, useRef } from "react";

const Background: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resize);
    resize();

    interface Blob {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      angle: number;
    }

    const blobs: Blob[] = [
      { x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: 300, color: "#EC4899", speedX: 0.5, speedY: -0.5, angle: 0 },
      { x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: 400, color: "#F5C518", speedX: 0.3, speedY: -0.4, angle: 0 },
      { x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: 350, color: "#DC2626", speedX: 0.4, speedY: -0.6, angle: 0 },
      { x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: 450, color: "#FB923C", speedX: 0.2, speedY: -0.3, angle: 0 },
    ];

    const render = () => {
      ctx.fillStyle = "#0F0F0F";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.filter = "blur(100px)";
      ctx.globalAlpha = 0.15;

      blobs.forEach((blob) => {
        // Sine wave movement
        blob.angle += 0.01;
        const driftX = Math.sin(blob.angle) * 2;
        const driftY = Math.cos(blob.angle) * 2;

        blob.x += blob.speedX + driftX;
        blob.y += blob.speedY + driftY;

        // Loop back from top-right to bottom-left
        if (blob.x > canvas.width + blob.size) blob.x = -blob.size;
        if (blob.y < -blob.size) blob.y = canvas.height + blob.size;

        ctx.fillStyle = blob.color;
        ctx.beginPath();
        // Slightly elliptical and changing shape
        const rx = blob.size * (1 + Math.sin(blob.angle * 0.5) * 0.1);
        const ry = blob.size * (1 + Math.cos(blob.angle * 0.5) * 0.1);
        ctx.ellipse(blob.x, blob.y, rx, ry, blob.angle * 0.2, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.filter = "none";
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      id="background-canvas"
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
    />
  );
};

export default Background;
