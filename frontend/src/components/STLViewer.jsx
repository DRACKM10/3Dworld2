"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

export default function STLViewer({ url }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!url) return;

    const width = mountRef.current.clientWidth;
    const height = 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#000");

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    camera.position.set(100, 100, 200);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);

    // luces
    const light1 = new THREE.DirectionalLight(0xffffff, 1);
    light1.position.set(1, 1, 1);
    scene.add(light1);

    const light2 = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(light2);

    const loader = new STLLoader();

    loader.load(
      url,
      (geometry) => {
        const material = new THREE.MeshStandardMaterial({
          color: 0xdddddd,
          metalness: 0.1,
          roughness: 0.7,
        });

        const mesh = new THREE.Mesh(geometry, material);
        geometry.center();
        mesh.rotation.x = -Math.PI / 2;

        scene.add(mesh);

        const animate = () => {
          requestAnimationFrame(animate);
          mesh.rotation.z += 0.01;
          renderer.render(scene, camera);
        };

        animate();
      },
      undefined,
      (error) => {
        console.error("❌ Error cargando STL:", error);
      }
    );

    return () => {
      mountRef.current.innerHTML = "";
      renderer.dispose();
    };
  }, [url]);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "400px",
        borderRadius: "8px",
        overflow: "hidden",
        background: "#111",
      }}
    />
  );
}
