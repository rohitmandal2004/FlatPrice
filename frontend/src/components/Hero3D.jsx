import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, BakeShadows } from '@react-three/drei';
import { Building } from './Building3D';
import * as THREE from 'three';

export default function Hero3D() {
  return (
    <div className="absolute inset-0 z-0 opacity-30 md:opacity-50 pointer-events-none md:pointer-events-auto overflow-hidden mix-blend-multiply">
      <Canvas 
        dpr={[1, 1.5]} 
        camera={{ position: [35, 20, 45], fov: 40 }} 
        performance={{ min: 0.5, max: 1 }} 
        gl={{ alpha: true, antialias: false }} // transparent background, no antialiasing for perf
      >
        <React.Suspense fallback={null}>
          <Environment resolution={64} background={false}>
            <mesh>
              <sphereGeometry args={[100, 8, 8]} />
              <meshBasicMaterial color="#e0f2fe" side={THREE.BackSide} />
            </mesh>
          </Environment>
          
          <ambientLight intensity={0.5} />
          <directionalLight position={[15, 25, 20]} intensity={1.5} color="#fffbeb" />
          <directionalLight position={[-15, 10, -20]} intensity={1.0} color="#38bdf8" />
          <hemisphereLight skyColor="#bae6fd" groundColor="#64748b" intensity={0.5} />
          
          <Building formData={{}} numFloors={8} /> {/* Using only 8 floors to save performance on Landing Page */}
          
          <OrbitControls 
            enablePan={false} 
            enableZoom={false}
            target={[0, 4, 0]}
            minPolarAngle={Math.PI / 4} 
            maxPolarAngle={Math.PI / 2.5}
            autoRotate={true}
            autoRotateSpeed={1.0}
          />
          <BakeShadows />
        </React.Suspense>
      </Canvas>
      
      {/* Fade out bottom to blend with the rest of the page */}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none"></div>
    </div>
  );
}
