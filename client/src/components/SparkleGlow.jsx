import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const SparkleGlow = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.003);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 120;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Clear container (for strict mode)
    while (currentMount.firstChild) {
      currentMount.removeChild(currentMount.firstChild);
    }
    currentMount.appendChild(renderer.domElement);

    // 2. Ambient Particles
    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 500;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 500;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 400;
        
        velocities.push({
            x: (Math.random() - 0.5) * 0.05,
            y: Math.random() * 0.08 + 0.02,
            z: (Math.random() - 0.5) * 0.05
        });
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Custom glowing texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(255,200,100,0.8)');
    gradient.addColorStop(0.5, 'rgba(255,150,50,0.2)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);
    const particleTexture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
        size: 1.5,
        map: particleTexture,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.6,
        color: 0xffdd88
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 3. AI Network Data Streams (connecting lines)
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending
    });
    const maxLines = 800;
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(maxLines * 6); 
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(linesMesh);

    // 4. Fireworks System
    const fireworks = [];
    const fireworkColors = [0xffaa00, 0xffdd88, 0x00aaff];
    
    function createFirework() {
        const isLeft = Math.random() > 0.5;
        const startX = isLeft ? -150 - Math.random() * 80 : 150 + Math.random() * 80;
        const startY = -150;
        
        const fireworkGroup = new THREE.Group();
        fireworkGroup.position.set(startX, startY, (Math.random() - 0.5) * 100);
        
        const trailGeo = new THREE.BufferGeometry();
        trailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0,0,0]), 3));
        const trailMat = new THREE.PointsMaterial({
            size: 3, map: particleTexture, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, color: 0xffddaa
        });
        const trail = new THREE.Points(trailGeo, trailMat);
        fireworkGroup.add(trail);
        scene.add(fireworkGroup);
        
        fireworks.push({
            group: fireworkGroup,
            phase: 'launch',
            velocity: { x: (isLeft ? 1 : -1) * (Math.random() * 0.4 + 0.1), y: Math.random() * 1.5 + 1.5, z: (Math.random() - 0.5) * 0.5 },
            life: 1.0,
            explodeParticles: null,
            targetY: Math.random() * 80 + 30
        });
    }

    function explode(firework) {
        firework.phase = 'explode';
        firework.group.remove(firework.group.children[0]);
        
        const fwParticleCount = 200;
        const fwGeo = new THREE.BufferGeometry();
        const fwPos = new Float32Array(fwParticleCount * 3);
        const fwVels = [];
        
        for(let i=0; i<fwParticleCount; i++) {
            fwPos[i*3] = 0; fwPos[i*3+1] = 0; fwPos[i*3+2] = 0;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            const speed = (Math.random() * Math.random()) * 1.5 + 0.2; 
            
            fwVels.push({
                x: Math.sin(phi) * Math.cos(theta) * speed,
                y: Math.sin(phi) * Math.sin(theta) * speed,
                z: Math.cos(phi) * speed
            });
        }
        
        fwGeo.setAttribute('position', new THREE.BufferAttribute(fwPos, 3));
        const color = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
        const fwMat = new THREE.PointsMaterial({
            size: 2, map: particleTexture, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, color: color, opacity: 0.9
        });
        
        const fwPoints = new THREE.Points(fwGeo, fwMat);
        firework.group.add(fwPoints);
        firework.explodeVels = fwVels;
        firework.explodeGeo = fwGeo;
    }

    // 5. Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();
    
    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        particles.rotation.y = Math.sin(time * 0.05) * 0.1;
        particles.rotation.x = Math.cos(time * 0.03) * 0.05;

        const posArray = particles.geometry.attributes.position.array;
        let lineIdx = 0;
        
        for (let i = 0; i < particleCount; i++) {
            posArray[i * 3] += velocities[i].x;
            posArray[i * 3 + 1] += velocities[i].y;
            posArray[i * 3 + 2] += velocities[i].z;
            
            if (posArray[i * 3 + 1] > 250) posArray[i * 3 + 1] = -250;
            
            velocities[i].x += (Math.random() - 0.5) * 0.003;
            velocities[i].z += (Math.random() - 0.5) * 0.003;
            velocities[i].x = Math.max(-0.1, Math.min(0.1, velocities[i].x));
            velocities[i].z = Math.max(-0.1, Math.min(0.1, velocities[i].z));

            if (i % 8 === 0 && lineIdx < maxLines * 6) {
                for (let j = i + 1; j < particleCount; j+= 25) {
                    const dx = posArray[i*3] - posArray[j*3];
                    const dy = posArray[i*3+1] - posArray[j*3+1];
                    const dz = posArray[i*3+2] - posArray[j*3+2];
                    const distSq = dx*dx + dy*dy + dz*dz;
                    
                    if (distSq < 600) {
                        linePositions[lineIdx++] = posArray[i*3];
                        linePositions[lineIdx++] = posArray[i*3+1];
                        linePositions[lineIdx++] = posArray[i*3+2];
                        linePositions[lineIdx++] = posArray[j*3];
                        linePositions[lineIdx++] = posArray[j*3+1];
                        linePositions[lineIdx++] = posArray[j*3+2];
                        if (lineIdx >= maxLines * 6) break;
                    }
                }
            }
        }
        particles.geometry.attributes.position.needsUpdate = true;
        
        for(let i = lineIdx; i < maxLines * 6; i++) {
            linePositions[i] = 0;
        }
        linesMesh.geometry.attributes.position.needsUpdate = true;

        if (Math.random() < 0.015 && fireworks.length < 6) {
            createFirework();
        }

        for (let i = fireworks.length - 1; i >= 0; i--) {
            const fw = fireworks[i];
            if (fw.phase === 'launch') {
                fw.group.position.x += fw.velocity.x;
                fw.group.position.y += fw.velocity.y;
                fw.group.position.z += fw.velocity.z;
                fw.velocity.x += Math.sin(time * 10 + i) * 0.02;
                if (fw.group.position.y >= fw.targetY) {
                    explode(fw);
                }
            } else if (fw.phase === 'explode') {
                const fwPos = fw.explodeGeo.attributes.position.array;
                for (let j = 0; j < fwPos.length / 3; j++) {
                    fwPos[j*3] += fw.explodeVels[j].x;
                    fwPos[j*3+1] += fw.explodeVels[j].y;
                    fwPos[j*3+2] += fw.explodeVels[j].z;
                    
                    fw.explodeVels[j].x *= 0.94;
                    fw.explodeVels[j].z *= 0.94;
                    fw.explodeVels[j].y *= 0.92; 
                    fw.explodeVels[j].y += 0.01; 
                }
                fw.explodeGeo.attributes.position.needsUpdate = true;
                
                fw.life -= 0.003;
                fw.group.children[0].material.opacity = Math.max(0, fw.life);
                
                if (fw.life <= 0) {
                    scene.remove(fw.group);
                    fireworks.splice(i, 1);
                }
            }
        }

        renderer.render(scene, camera);
    }

    animate();

    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        renderer.dispose();
        geometry.dispose();
        material.dispose();
        lineGeometry.dispose();
        lineMaterial.dispose();
        particleTexture.dispose();
        fireworks.forEach(fw => {
            scene.remove(fw.group);
            if(fw.explodeGeo) fw.explodeGeo.dispose();
        });
        if (currentMount) {
            while (currentMount.firstChild) {
                currentMount.removeChild(currentMount.firstChild);
            }
        }
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="fixed inset-0 pointer-events-none z-0" 
      aria-hidden="true"
      style={{ backgroundColor: '#050505' }}
    />
  );
};

export default SparkleGlow;
