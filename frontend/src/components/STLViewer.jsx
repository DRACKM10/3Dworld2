"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Box } from "@chakra-ui/react";

export default function STLViewer({ url }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 🎨 Crear escena, cámara y renderizador
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(3, 3, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // 💡 Luces
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    // 📦 Cargar STL
    const loader = new STLLoader();
    loader.load(url, (geometry) => {
      const material = new THREE.MeshPhongMaterial({ color: 0x5588ff });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      scene.add(mesh);
    });

    // 🖱️ Controles
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 🎬 Animación
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 🔁 Ajuste de tamaño
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      container.removeChild(renderer.domElement);
      window.removeEventListener("resize", handleResize);
    };
  }, [url]);

  return (
    <Box
      ref={mountRef}
      width="100%"
      height="500px"
      borderRadius="lg"
      boxShadow="lg"
      bg="gray.100"
    />
  );
}
