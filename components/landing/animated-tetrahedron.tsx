"use client";

import { useEffect, useRef } from "react";

export function AnimatedTetrahedron() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const chars = "░▒▓█▀▄▌▐│─┤├┴┬╭╮╰╯";
    const colors = ["#1f71a1", "#46a65c"];

    let time = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    // Tetrahedron vertices
    const vertices = [
      { x: 0, y: 1, z: 0 },
      { x: -0.943, y: -0.333, z: -0.5 },
      { x: 0.943, y: -0.333, z: -0.5 },
      { x: 0, y: -0.333, z: 1 },
    ];

    // Edges connecting vertices
    const edges = [
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 2],
      [2, 3],
      [3, 1],
    ];

    // Faces
    const faces = [
      [0, 1, 2],
      [0, 2, 3],
      [0, 3, 1],
      [1, 3, 2],
    ];

    const rotateY = (
      point: { x: number; y: number; z: number },
      angle: number
    ) => ({
      x: point.x * Math.cos(angle) - point.z * Math.sin(angle),
      y: point.y,
      z: point.x * Math.sin(angle) + point.z * Math.cos(angle),
    });

    const rotateX = (
      point: { x: number; y: number; z: number },
      angle: number
    ) => ({
      x: point.x,
      y: point.y * Math.cos(angle) - point.z * Math.sin(angle),
      z: point.y * Math.sin(angle) + point.z * Math.cos(angle),
    });

    const rotateZ = (
      point: { x: number; y: number; z: number },
      angle: number
    ) => ({
      x: point.x * Math.cos(angle) - point.y * Math.sin(angle),
      y: point.x * Math.sin(angle) + point.y * Math.cos(angle),
      z: point.z,
    });

    const render = () => {
      const rect = canvas.getBoundingClientRect();

      ctx.clearRect(0, 0, rect.width, rect.height);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const scale = Math.min(rect.width, rect.height) * 0.7;

      ctx.font = "18px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const points: {
        x: number;
        y: number;
        z: number;
        char: string;
        color: string;
      }[] = [];

      let pointIndex = 0;

      // Generate points along edges
      edges.forEach(([i, j], edgeIndex) => {
        const v1 = vertices[i];
        const v2 = vertices[j];

        let localIndex = 0;

        for (let t = 0; t <= 1; t += 0.05) {
          let point = {
            x: v1.x + (v2.x - v1.x) * t,
            y: v1.y + (v2.y - v1.y) * t,
            z: v1.z + (v2.z - v1.z) * t,
          };

          // Apply rotations
          point = rotateY(point, time * 0.4);
          point = rotateX(point, time * 0.3);
          point = rotateZ(point, time * 0.2);

          const depth = (point.z + 1.5) / 3;

          const charIndex = Math.floor(
            depth * (chars.length - 1)
          );

          // Alternate colors
          const color =
            (edgeIndex + localIndex) % 2 === 0
              ? colors[0]
              : colors[1];

          points.push({
            x: centerX + point.x * scale,
            y: centerY - point.y * scale,
            z: point.z,
            char: chars[Math.min(charIndex, chars.length - 1)],
            color,
          });

          pointIndex++;
          localIndex++;
        }
      });

      // Generate points on faces
      faces.forEach(([i, j, k], faceIndex) => {
        const v1 = vertices[i];
        const v2 = vertices[j];
        const v3 = vertices[k];

        let localIndex = 0;

        for (let u = 0; u <= 1; u += 0.12) {
          for (let v = 0; v <= 1 - u; v += 0.12) {
            const w = 1 - u - v;

            let point = {
              x: v1.x * u + v2.x * v + v3.x * w,
              y: v1.y * u + v2.y * v + v3.y * w,
              z: v1.z * u + v2.z * v + v3.z * w,
            };

            // Apply rotations
            point = rotateY(point, time * 0.4);
            point = rotateX(point, time * 0.3);
            point = rotateZ(point, time * 0.2);

            const depth = (point.z + 1.5) / 3;

            const charIndex = Math.floor(
              depth * (chars.length - 1)
            );

            // Alternate colors across each face
            const color =
              (faceIndex + localIndex) % 2 === 0
                ? colors[0]
                : colors[1];

            points.push({
              x: centerX + point.x * scale,
              y: centerY - point.y * scale,
              z: point.z,
              char: chars[Math.min(charIndex, chars.length - 1)],
              color,
            });

            pointIndex++;
            localIndex++;
          }
        }
      });

      // Sort by z for depth
      points.sort((a, b) => a.z - b.z);

      // Draw points
      points.forEach((point) => {
        /*
         * Keep the actual blue/green colors.
         * Depth is represented through opacity only.
         */
        const alpha =
          0.65 + (point.z + 1.5) * 0.175;

        ctx.globalAlpha = Math.min(alpha, 1);
        ctx.fillStyle = point.color;

        ctx.fillText(
          point.char,
          point.x,
          point.y
        );
      });

      ctx.globalAlpha = 1;

      time += 0.015;
      frameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: "block" }}
    />
  );
}