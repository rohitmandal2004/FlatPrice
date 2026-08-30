import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Text, Environment, Float, Sparkles, Billboard, BakeShadows, Preload, Html } from '@react-three/drei';
import * as THREE from 'three';
import { playClickSound, playWhooshSound, startRainSound, stopRainSound } from '../utils/audio';

// --- SHARED GLOBALS FOR MAXIMUM PERFORMANCE ---
const sharedGeometries = {
  box: new THREE.BoxGeometry(1, 1, 1),
  plane: new THREE.PlaneGeometry(1, 1),
  cylinder: new THREE.CylinderGeometry(1, 1, 1, 16),
  cone: new THREE.ConeGeometry(1, 1, 8),
  sphere: new THREE.SphereGeometry(1, 16, 16)
};

const sharedMaterials = {
  hitbox: new THREE.MeshBasicMaterial({ visible: false }),
  flatMainDef: new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.5 }),
  flatMainHov: new THREE.MeshStandardMaterial({ color: '#047857', roughness: 0.5 }),
  flatMainSel: new THREE.MeshStandardMaterial({ color: '#064e3b', roughness: 0.5 }),
  flatGlassDef: new THREE.MeshBasicMaterial({ color: '#e0f2fe', transparent: true, opacity: 0.4, depthWrite: false }),
  flatGlassSel: new THREE.MeshBasicMaterial({ color: '#34d399', transparent: true, opacity: 0.4, depthWrite: false }),
  flatFloor: new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.8 }),
  flatCeil: new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.9 }),
  flatTrim: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2, metalness: 0.1 }),
  doorFrame: new THREE.MeshStandardMaterial({ color: '#0f172a' }),
  doorGlass: new THREE.MeshBasicMaterial({ color: '#bae6fd', transparent: true, opacity: 0.3, depthWrite: false }),
  treeTrunk: new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.9 }),
  treeLeaves1: new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.9 }),
  treeLeaves2: new THREE.MeshStandardMaterial({ color: '#166534', roughness: 0.9 }),
  carRoof: new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.1, metalness: 0.8 }),
  carWheel: new THREE.MeshStandardMaterial({ color: '#111', roughness: 0.9 }),
  humanHead: new THREE.MeshStandardMaterial({ color: '#fcd34d' }),
  humanBody: new THREE.MeshStandardMaterial({ color: '#3b82f6' }),
  visitorBody: new THREE.MeshStandardMaterial({ color: '#ef4444' }),
};
// ----------------------------------------------

const Car = ({ initialPosition, direction, color }) => {
  const ref = useRef();
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.position.z += direction * delta * 8; // Speed
    if (direction > 0 && ref.current.position.z > 25) ref.current.position.z = -25;
    if (direction < 0 && ref.current.position.z < -25) ref.current.position.z = 25;
  });

  return (
    <group ref={ref} position={initialPosition} rotation={[0, direction > 0 ? 0 : Math.PI, 0]}>
      {/* Body */}
      <mesh position={[0, 0.3, 0]} scale={[0.8, 0.4, 1.8]} geometry={sharedGeometries.box}>
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 0.65, -0.1]} scale={[0.7, 0.3, 1]} geometry={sharedGeometries.box} material={sharedMaterials.carRoof} />
      {/* Wheels */}
      {[-0.45, 0.45].map((x) => 
        [-0.6, 0.6].map((z) => (
          <mesh key={`wheel-${x}-${z}`} position={[x, 0.15, z]} rotation={[0, 0, Math.PI / 2]} scale={[0.15, 0.1, 0.15]} geometry={sharedGeometries.cylinder} material={sharedMaterials.carWheel} />
        ))
      )}
    </group>
  );
};

const Humanoid = ({ initialPosition, offset }) => {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    // Bobbing animation
    ref.current.position.y = initialPosition[1] + Math.abs(Math.sin(t * 8 + offset)) * 0.1;
    // Walking animation along Z
    ref.current.position.z = initialPosition[2] + Math.sin(t * 0.5 + offset) * 5;
  });

  return (
    <group ref={ref} position={initialPosition}>
      <mesh position={[0, 0.3, 0]} scale={[0.12, 0.4, 0.12]} geometry={sharedGeometries.cylinder} material={sharedMaterials.humanBody} />
      <mesh position={[0, 0.6, 0]} scale={[0.15, 0.15, 0.15]} geometry={sharedGeometries.sphere} material={sharedMaterials.humanHead} />
    </group>
  );
};

const Store = ({ position, color, rotY = 0 }) => (
  <group position={position} rotation={[0, rotY, 0]}>
    <mesh position={[0, 1.5, 0]} scale={[4, 3, 3]} geometry={sharedGeometries.box}>
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
    {/* Glass Front */}
    <mesh position={[0, 1.2, 1.51]} scale={[3, 1.8, 1]} geometry={sharedGeometries.plane}>
      <meshStandardMaterial color="#38bdf8" transparent opacity={0.6} roughness={0.1} />
    </mesh>
    {/* Awning */}
    <mesh position={[0, 2.2, 1.9]} rotation={[-Math.PI / 6, 0, 0]} scale={[3.8, 0.1, 1]} geometry={sharedGeometries.box}>
      <meshStandardMaterial color="#ef4444" />
    </mesh>
  </group>
);

const VisitorHumanoid = ({ initialPosition, offset, isLeaving = false }) => {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.position.y = initialPosition[1] + Math.abs(Math.sin(t * 8 + offset)) * 0.1;
    
    const cycle = (t + offset) % 8;
    if (cycle < 4) {
      if (isLeaving) {
        ref.current.position.x = -2.2 - cycle * 1.7; 
      } else {
        ref.current.position.x = initialPosition[0] + cycle * 1.7; 
      }
      ref.current.visible = true;
    } else {
      ref.current.visible = false; 
    }
  });

  return (
    <group ref={ref} position={initialPosition} rotation={[0, isLeaving ? Math.PI / 2 : -Math.PI / 2, 0]}>
      <mesh position={[0, 0.3, 0]} scale={[0.12, 0.4, 0.12]} geometry={sharedGeometries.cylinder} material={sharedMaterials.visitorBody} />
      <mesh position={[0, 0.6, 0]} scale={[0.15, 0.15, 0.15]} geometry={sharedGeometries.sphere} material={sharedMaterials.humanHead} />
    </group>
  );
};

const House = ({ position, color, rotY = 0, floors = 1 }) => {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Base(s) */}
      {Array.from({length: floors}).map((_, i) => (
        <mesh key={`floor-${i}`} position={[0, 0.5 + i * 1, 0]} scale={[3, 1, 3]} geometry={sharedGeometries.box}>
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
      {/* Roof */}
      <mesh position={[0, 1.3 + (floors - 1) * 1, 0]} rotation={[0, Math.PI / 4, 0]} scale={[2.5, 1, 4]} geometry={sharedGeometries.cone}>
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>
      {/* Door */}
      <mesh position={[0, 0.4, 1.51]} scale={[0.6, 0.8, 0.05]} geometry={sharedGeometries.box}>
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
};

const Tree = ({ position, scale = 1 }) => {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.4, 0]} scale={[0.1, 0.8, 0.1]} geometry={sharedGeometries.cylinder} material={sharedMaterials.treeTrunk} />
      <mesh position={[0, 1.2, 0]} scale={[0.8, 1.5, 0.8]} geometry={sharedGeometries.cone} material={sharedMaterials.treeLeaves1} />
      <mesh position={[0, 1.8, 0]} scale={[0.6, 1.2, 0.6]} geometry={sharedGeometries.cone} material={sharedMaterials.treeLeaves2} />
    </group>
  );
};

const WeatherSystem = ({ type }) => {
  const meshRef = useRef();
  // Drastically reduced particle count for maximum performance (buttery smooth)
  const count = type === 'rain' ? 800 : 400;
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 60;
      const y = Math.random() * 40;
      const z = (Math.random() - 0.5) * 60;
      const speed = type === 'rain' ? 0.3 + Math.random() * 0.2 : 0.02 + Math.random() * 0.03;
      temp.push({ x, y, z, speed, initialX: x });
    }
    return temp;
  }, [count, type]);

  useFrame((state) => {
    if (!meshRef.current || type === 'clear') return;
    const time = state.clock.getElapsedTime();
    
    particles.forEach((particle, i) => {
      particle.y -= particle.speed;
      if (particle.y < 0) particle.y = 40;
      
      if (type === 'snow') {
        particle.x = particle.initialX + Math.sin(time + particle.y * 0.5) * 0.5;
      }
      
      dummy.position.set(particle.x, particle.y, particle.z);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (type === 'clear') return null;

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      {type === 'rain' ? (
        <boxGeometry args={[0.04, 0.8, 0.04]} /> // Scaled up to compensate for fewer particles
      ) : (
        <sphereGeometry args={[0.15, 4, 4]} />
      )}
      <meshBasicMaterial color={type === 'rain' ? '#93c5fd' : '#ffffff'} transparent opacity={type === 'rain' ? 0.4 : 0.8} depthWrite={false} />
    </instancedMesh>
  );
};

const CameraController = ({ interiorTarget, orbitControlsRef }) => {
  const { camera } = useThree();
  
  useFrame(() => {
    if (interiorTarget && orbitControlsRef.current) {
      orbitControlsRef.current.enabled = false;
      
      // Calculate position just outside the balcony looking in
      const offset = 4.5;
      const targetCamPos = new THREE.Vector3(
        interiorTarget.pos[0] + (interiorTarget.facing === 'East' ? offset : interiorTarget.facing === 'West' ? -offset : 0),
        interiorTarget.pos[1] + 1.2,
        interiorTarget.pos[2] + (interiorTarget.facing === 'North' ? -offset : interiorTarget.facing === 'South' ? offset : 0)
      );
      
      const targetLookAt = new THREE.Vector3(
        interiorTarget.pos[0],
        interiorTarget.pos[1] + 1.0,
        interiorTarget.pos[2]
      );

      camera.position.lerp(targetCamPos, 0.08);
      orbitControlsRef.current.target.lerp(targetLookAt, 0.08);
    } else if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = true;
    }
  });

  return null;
};

const FlatSegment = React.memo(({ position, facing, floor, isSelected, onSelect, onDoubleClick, width = 1.8, predictedPrice }) => {
  const [hovered, setHovered] = useState(false);
  const halfWidth = width / 2;
  const isTarget = isSelected || hovered;

  const mainMat = isSelected ? sharedMaterials.flatMainSel : (hovered ? sharedMaterials.flatMainHov : sharedMaterials.flatMainDef);
  const glassMat = isTarget ? sharedMaterials.flatGlassSel : sharedMaterials.flatGlassDef;

  let rotY = 0;
  if (facing === 'East') rotY = Math.PI / 2;
  if (facing === 'West') rotY = -Math.PI / 2;
  if (facing === 'North') rotY = Math.PI;

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* INVISIBLE HITBOX FOR O(1) RAYCASTING */}
      <mesh 
        position={[0, 0.05, 0]} 
        scale={[width, 1.4, 2.8]} 
        geometry={sharedGeometries.box} 
        material={sharedMaterials.hitbox}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        onDoubleClick={(e) => { e.stopPropagation(); if (onDoubleClick) onDoubleClick(position, facing); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }} 
        onPointerOut={() => setHovered(false)}
      />

      {/* 3D Price Tag Overlay */}
      {isSelected && predictedPrice && (
        <Html position={[0, 0.6, 1.5]} center zIndexRange={[100, 0]} className="pointer-events-none">
          <div className="flex flex-col items-center animate-in zoom-in duration-300">
            <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xl border border-emerald-400 text-center whitespace-nowrap">
              <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Est. Value</div>
              <div className="text-xl font-black text-slate-800 tracking-tight">₹{predictedPrice} <span className="text-sm text-slate-500">L</span></div>
            </div>
            <div className="w-2 h-2 bg-emerald-400 rotate-45 -mt-1 border-b border-r border-emerald-400 shadow-sm"></div>
          </div>
        </Html>
      )}

      {/* Main Room Structure */}
      <group>
        {/* Back Wall */}
        <mesh position={[0, 0, -0.55]} scale={[width - 0.2, 0.9, 0.1]} geometry={sharedGeometries.box} material={mainMat} />
        {/* Floor */}
        <mesh position={[0, -0.4, 0]} scale={[width - 0.2, 0.1, 1.0]} geometry={sharedGeometries.box} material={sharedMaterials.flatFloor} />
        {/* Ceiling */}
        <mesh position={[0, 0.4, 0]} scale={[width - 0.2, 0.1, 1.0]} geometry={sharedGeometries.box} material={sharedMaterials.flatCeil} />
        {/* Left Wall */}
        <mesh position={[-halfWidth + 0.05, 0, 0]} scale={[0.1, 0.9, 1.0]} geometry={sharedGeometries.box} material={mainMat} />
        {/* Right Wall */}
        <mesh position={[halfWidth - 0.05, 0, 0]} scale={[0.1, 0.9, 1.0]} geometry={sharedGeometries.box} material={mainMat} />
      </group>

      {/* Balcony Base */}
      <mesh position={[0, -0.4, 0.9]} scale={[width, 0.1, 0.6]} geometry={sharedGeometries.box} material={mainMat} receiveShadow castShadow />

      {/* Premium White Trim */}
      <mesh position={[0, -0.4, 1.22]} scale={[width + 0.02, 0.12, 0.05]} geometry={sharedGeometries.box} material={sharedMaterials.flatTrim} receiveShadow castShadow />

      {/* Glass Railings */}
      <mesh position={[0, -0.15, 1.21]} scale={[width, 0.5, 1]} geometry={sharedGeometries.plane} material={glassMat} />
      <mesh position={[-halfWidth - 0.01, -0.15, 0.9]} rotation={[0, Math.PI / 2, 0]} scale={[0.6, 0.5, 1]} geometry={sharedGeometries.plane} material={glassMat} />
      <mesh position={[halfWidth + 0.01, -0.15, 0.9]} rotation={[0, Math.PI / 2, 0]} scale={[0.6, 0.5, 1]} geometry={sharedGeometries.plane} material={glassMat} />

      {/* Transparent Sliding Door */}
      <group position={[0, 0.05, 0.62]}>
        <mesh position={[-width * 0.3 + 0.025, 0, 0]} scale={[0.05, 0.7, 0.05]} geometry={sharedGeometries.box} material={sharedMaterials.doorFrame} />
        <mesh position={[width * 0.3 - 0.025, 0, 0]} scale={[0.05, 0.7, 0.05]} geometry={sharedGeometries.box} material={sharedMaterials.doorFrame} />
        <mesh position={[0, 0.35 - 0.025, 0]} scale={[width * 0.6, 0.05, 0.05]} geometry={sharedGeometries.box} material={sharedMaterials.doorFrame} />
        <mesh position={[0, 0, 0]} scale={[width * 0.6, 0.7, 1]} geometry={sharedGeometries.plane} material={sharedMaterials.doorGlass} />
      </group>
    </group>
  );
}, (prev, next) => {
  return prev.isSelected === next.isSelected && 
         prev.predictedPrice === next.predictedPrice &&
         prev.hovered === next.hovered; 
});

export const Building = React.memo(({ formData = {}, onSelectFlat = () => {}, onDoubleClickFlat = () => {}, predictedPrice = null, numFloors = 14 }) => {
  const [selectedSubId, setSelectedSubId] = useState(null);

  const handleSelect = (floor, facing, subId) => {
    setSelectedSubId(subId);
    onSelectFlat(floor, facing, subId);
  };

  const floors = [];
  const floorHeight = 1;
  const buildingYOffset = 0.5;
  const buildingHeight = numFloors * floorHeight;

  for (let i = 1; i <= numFloors; i++) {
    const y = (i - 1) * floorHeight;
    const facings = [
      { name: 'North', pos: [-1.0, y, -3.2], width: 1.8, subId: `N1-${i}` },
      { name: 'North', pos: [1.0, y, -3.2], width: 1.8, subId: `N2-${i}` },
      { name: 'South', pos: [-1.0, y, 3.2], width: 1.8, subId: `S1-${i}` },
      { name: 'South', pos: [1.0, y, 3.2], width: 1.8, subId: `S2-${i}` },
      { name: 'East', pos: [2.0, y, -1.7], width: 2.8, subId: `E1-${i}` },
      { name: 'East', pos: [2.0, y, 1.7], width: 2.8, subId: `E2-${i}` },
      { name: 'West', pos: [-2.0, y, -1.7], width: 2.8, subId: `W1-${i}` },
      { name: 'West', pos: [-2.0, y, 1.7], width: 2.8, subId: `W2-${i}` },
    ];
    facings.forEach(face => {
      const isFormMatch = formData.floor === i && formData.facing === face.name;
      let isSelected = false;
      if (isFormMatch) {
        if (selectedSubId && selectedSubId.endsWith(`-${i}`) && selectedSubId.startsWith(face.name[0])) {
           isSelected = selectedSubId === face.subId;
        } else {
           isSelected = face.subId.includes('1-');
        }
      }

      floors.push(
        <FlatSegment 
          key={face.subId} 
          position={face.pos} 
          facing={face.name} 
          floor={i} 
          isSelected={isSelected} 
          width={face.width}
          onSelect={() => handleSelect(i, face.name, face.subId)} 
          onDoubleClick={(pos, facing) => onDoubleClickFlat({pos, facing, floor: i})}
          predictedPrice={isSelected ? predictedPrice : null}
        />
      );
    });
  }

  const core = (
    <group key="core" position={[0, (buildingHeight / 2) - 0.5, 0]}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={[2.8, buildingHeight, 5.2]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>
      
      {/* Louvers */}
      {Array.from({length: numFloors * 3}).map((_, i) => (
        <mesh key={`louver-${i}`} position={[0, (i * (buildingHeight/(numFloors*3))) - buildingHeight/2 + 0.15, 0]}>
          <boxGeometry args={[4.1, 0.05, 6.5]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
      ))}

      {/* High-end corner glass shafts (Optimized) */}
      {[ [2.01, 3.21, Math.PI/4], [-2.01, 3.21, -Math.PI/4], [2.01, -3.21, -Math.PI/4], [-2.01, -3.21, Math.PI/4] ].map((pos, idx) => (
        <mesh key={`glass-${idx}`} position={[pos[0], 0, pos[1]]} rotation={[0, pos[2], 0]}>
          <planeGeometry args={[0.5, buildingHeight]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.3} roughness={0.1} side={THREE.DoubleSide} emissive="#0ea5e9" emissiveIntensity={0.2} />
        </mesh>
      ))}
    </group>
  );

  const pillars = [];
  for (let px of [-2.5, 2.5]) {
    for (let pz of [-3.5, 3.5]) {
      pillars.push(
        <mesh key={`pillar-${px}-${pz}`} position={[px, -0.5, pz]}>
          <boxGeometry args={[0.4, 1, 0.4]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
        </mesh>
      );
    }
  }
  pillars.push(
    <mesh key="core-pillar" position={[0, -0.5, 0]}>
      <boxGeometry args={[4.1, 1, 6.5]} />
      <meshStandardMaterial color="#1e293b" roughness={0.9} />
    </mesh>
  );

  const roofY = buildingHeight - 0.5;
  const roof = (
    <group key="roof" position={[0, roofY, 0]}>
      {/* Penthouse Slab */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[6.4, 0.2, 8.8]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
      </mesh>
      {/* Decorative Outer Frame */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[6.2, 0.8, 8.6]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[6.0, 0.81, 8.4]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Roof Direction Indicators (On the outer frame) */}
      <Text position={[0, 1.1, -4.35]} rotation={[0, Math.PI, 0]} fontSize={0.6} color="#ef4444" fontWeight="bold" anchorX="center" anchorY="middle">
        NORTH
      </Text>
      <Text position={[0, 1.1, 4.35]} rotation={[0, 0, 0]} fontSize={0.6} color="#e2e8f0" fontWeight="bold" anchorX="center" anchorY="middle">
        SOUTH
      </Text>
      <Text position={[3.15, 1.1, 0]} rotation={[0, Math.PI / 2, 0]} fontSize={0.6} color="#e2e8f0" fontWeight="bold" anchorX="center" anchorY="middle">
        EAST
      </Text>
      <Text position={[-3.15, 1.1, 0]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.6} color="#e2e8f0" fontWeight="bold" anchorX="center" anchorY="middle">
        WEST
      </Text>

      {/* Swimming Pool */}
      <mesh position={[1.5, 0.72, 2.5]}>
        <boxGeometry args={[2, 0.05, 2.5]} />
        <meshStandardMaterial color="#06b6d4" transparent opacity={0.8} roughness={0.1} emissive="#0891b2" emissiveIntensity={0.3} />
      </mesh>
      <Sparkles position={[1.5, 1.2, 2.5]} count={40} scale={2.5} size={2} color="#67e8f9" speed={0.4} opacity={0.6} />
      <mesh position={[1.5, 0.7, 2.5]}>
        <boxGeometry args={[2.1, 0.1, 2.6]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[1.5, 0.71, 2.5]}>
        <boxGeometry args={[1.9, 0.02, 2.4]} />
        <meshStandardMaterial color="#38bdf8" />
      </mesh>

      {/* Helipad */}
      <mesh position={[-1.5, 0.71, -2.5]}>
        <cylinderGeometry args={[1.0, 1.0, 0.05, 32]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {/* Glowing ring around helipad */}
      <mesh position={[-1.5, 0.74, -2.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 0.95, 32]} />
        <meshBasicMaterial color="#ef4444" side={THREE.DoubleSide} />
      </mesh>
      {/* H Marker */}
      <mesh position={[-1.5, 0.712, -2.3]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[0.1, 0.6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-1.1, 0.712, -2.3]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[0.1, 0.6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-1.3, 0.712, -2.3]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[0.3, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
  
  const compound = (
    <group key="compound">
      {/* Outer Ground (City Level) */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[60, 0.2, 60]} />
        <meshStandardMaterial color="#a8a29e" roughness={1} />
      </mesh>
      
      {/* Compound Base (Inside walls) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[19, 0.1, 19]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.9} />
      </mesh>
      
      {/* Grand Entrance Canopy */}
      <group position={[-2.3, 0.5, 0]}>
        <mesh position={[-1.3, -0.5, 1]}>
          <cylinderGeometry args={[0.05, 0.05, 1]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} />
        </mesh>
        <mesh position={[-1.3, -0.5, -1]}>
          <cylinderGeometry args={[0.05, 0.05, 1]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} />
        </mesh>
        <mesh position={[-0.5, 0, 0]}>
          <boxGeometry args={[2.5, 0.15, 3]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} />
        </mesh>
      </group>

      {/* Boundary Walls */}
      <group position={[0, 0.75, 0]}>
        {/* North Wall */}
        <mesh position={[0, 0, -9.4]}>
          <boxGeometry args={[19, 1.5, 0.2]} />
          <meshStandardMaterial color="#475569" roughness={0.8} />
        </mesh>
        {/* South Wall */}
        <mesh position={[0, 0, 9.4]}>
          <boxGeometry args={[19, 1.5, 0.2]} />
          <meshStandardMaterial color="#475569" roughness={0.8} />
        </mesh>
        {/* East Wall */}
        <mesh position={[9.4, 0, 0]}>
          <boxGeometry args={[0.2, 1.5, 19]} />
          <meshStandardMaterial color="#475569" roughness={0.8} />
        </mesh>
        {/* Front Wall (West) with Gate Gap */}
        <mesh position={[-9.4, 0, -6]}>
          <boxGeometry args={[0.2, 1.5, 7]} />
          <meshStandardMaterial color="#475569" roughness={0.8} />
        </mesh>
        <mesh position={[-9.4, 0, 6]}>
          <boxGeometry args={[0.2, 1.5, 7]} />
          <meshStandardMaterial color="#475569" roughness={0.8} />
        </mesh>
      </group>

      {/* Sleek Dark Gate */}
      <mesh position={[-9.4, 0.75, -1.2]}>
        <boxGeometry args={[0.05, 1.5, 2.4]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} />
      </mesh>
      <mesh position={[-9.4, 0.75, 1.2]}>
        <boxGeometry args={[0.05, 1.5, 2.4]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} />
      </mesh>

      {/* Direction Labels - Upgraded to an aesthetic Compass Rose */}
      <group position={[0, 0.06, 0]}>
        {/* Outer Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[4.8, 5.0, 64]} />
          <meshStandardMaterial color="#1e293b" opacity={0.6} transparent />
        </mesh>
        
        {/* Inner Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.8, 3.9, 64]} />
          <meshStandardMaterial color="#1e293b" opacity={0.3} transparent />
        </mesh>

        {/* N S E W Markers */}
        <Text position={[0, 0.1, -5.6]} rotation={[-Math.PI / 2, 0, 0]} fontSize={1.2} color="#ef4444" fontWeight="bold" outlineWidth={0.03} outlineColor="#ffffff">
          NORTH
        </Text>
        <Text position={[0, 0.1, 5.6]} rotation={[-Math.PI / 2, 0, Math.PI]} fontSize={1.2} color="#1e293b" fontWeight="bold" outlineWidth={0.03} outlineColor="#ffffff">
          SOUTH
        </Text>
        <Text position={[5.6, 0.1, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} fontSize={1.2} color="#1e293b" fontWeight="bold" outlineWidth={0.03} outlineColor="#ffffff">
          EAST
        </Text>
        <Text position={[-5.6, 0.1, 0]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]} fontSize={1.2} color="#1e293b" fontWeight="bold" outlineWidth={0.03} outlineColor="#ffffff">
          WEST
        </Text>

        {/* Compass Arrows */}
        <mesh position={[0, 0.01, -4.8]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.4, 1.0, 4]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        <mesh position={[0, 0.01, 4.8]} rotation={[-Math.PI / 2, 0, Math.PI]}>
          <coneGeometry args={[0.4, 1.0, 4]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        <mesh position={[4.8, 0.01, 0]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.4, 1.0, 4]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        <mesh position={[-4.8, 0.01, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
          <coneGeometry args={[0.4, 1.0, 4]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
      </group>

      {/* Main Building Ground Amenities */}
      {/* Swimming Pool (East side) */}
      <group position={[4, 0.05, -4]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4, 0.1, 6]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3, 5]} />
          <meshStandardMaterial color="#0284c7" transparent opacity={0.8} />
        </mesh>
        {/* Sunbeds */}
        <mesh position={[-1, 0.1, 3.2]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.8, 0.2, 1.2]} />
          <meshStandardMaterial color="#fcd34d" />
        </mesh>
        <mesh position={[1, 0.1, 3.2]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.8, 0.2, 1.2]} />
          <meshStandardMaterial color="#fcd34d" />
        </mesh>
      </group>

      {/* Car Parking Area (North-West side) */}
      <group position={[-6, 0.06, -5.5]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[5, 0.02, 7.5]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
        {/* Parking lines */}
        {[-3, -1, 1, 3].map((z, idx) => (
          <mesh key={`parkline-${idx}`} position={[0, 0.02, z]}>
            <boxGeometry args={[4.5, 0.01, 0.1]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        ))}
        {/* Parked Cars */}
        <group position={[1, 0, -2]}>
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[1.6, 0.4, 0.8]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <boxGeometry args={[0.8, 0.3, 0.7]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
        <group position={[-0.5, 0, 0]}>
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[1.6, 0.4, 0.8]} />
            <meshStandardMaterial color="#3b82f6" />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <boxGeometry args={[0.8, 0.3, 0.7]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
        <group position={[0.5, 0, 2]}>
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[1.6, 0.4, 0.8]} />
            <meshStandardMaterial color="#10b981" />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <boxGeometry args={[0.8, 0.3, 0.7]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      </group>

      {/* Sitting Area (South-West) */}
      <group position={[-4, 0.05, 4]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[2, 2, 0.1, 32]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.05, 32]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
        <mesh position={[1, 0.2, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.8, 0.2, 0.4]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh position={[-1, 0.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <boxGeometry args={[0.8, 0.2, 0.4]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
      </group>

      {/* Trees */}
      <Tree position={[4.5, 0.1, 4.5]} scale={1.2} />
      <Tree position={[4.8, 0.1, -4.8]} scale={0.9} />
      <Tree position={[-4.5, 0.1, 4.8]} scale={1.1} />
      <Tree position={[-4.5, 0.1, -4.5]} scale={1.3} />
      <Tree position={[0, 0.1, 6.2]} scale={0.8} />
      <Tree position={[0, 0.1, -6.2]} scale={1.0} />
      <Tree position={[6.2, 0.1, 0]} scale={1.0} />

      {/* North Lawn */}
      <mesh position={[0, 0.01, -14]}>
        <boxGeometry args={[20, 0.1, 10]} />
        <meshStandardMaterial color="#4d7c0f" roughness={1} />
      </mesh>
      {/* South Lawn */}
      <mesh position={[0, 0.01, 14]}>
        <boxGeometry args={[20, 0.1, 10]} />
        <meshStandardMaterial color="#4d7c0f" roughness={1} />
      </mesh>

      {/* North / South Residential Areas */}
      <House position={[6, 0, -14]} color="#e2e8f0" rotY={0} floors={2} />
      <House position={[-6, 0, -14]} color="#d6d3d1" rotY={0} floors={2} />
      {/* Dense plantation in the middle North */}
      <Tree position={[0, 0.1, -12]} scale={1.3} />
      <Tree position={[1, 0.1, -14]} scale={1.0} />
      <Tree position={[-1, 0.1, -15]} scale={1.5} />
      <Tree position={[2, 0.1, -13]} scale={1.2} />
      <Tree position={[-2, 0.1, -13.5]} scale={1.4} />
      <Tree position={[0, 0.1, -16]} scale={1.1} />
      
      <House position={[0, 0, 14]} color="#f8fafc" rotY={Math.PI} />
      <House position={[6, 0, 14]} color="#e7e5e4" rotY={Math.PI} />
      
      {/* Swimming Pool in South */}
      <group position={[-6, 0.05, 14]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[6, 0.1, 4]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[5, 3]} />
          <meshStandardMaterial color="#0ea5e9" transparent opacity={0.8} />
        </mesh>
      </group>

      {/* Outer Road (Front) */}
      <mesh position={[-13.5, 0.05, 0]}>
        <boxGeometry args={[4, 0.05, 50]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
      {/* Dashed line */}
      {Array.from({length: 25}).map((_, i) => (
        <mesh key={`dash-${i}`} position={[-13.5, 0.08, -24 + (i * 2)]}>
          <boxGeometry args={[0.1, 0.01, 1]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
      
      {/* Animated Cars */}
      <Car initialPosition={[-12.5, 0.05, -15]} direction={1} color="#ef4444" />
      <Car initialPosition={[-14.5, 0.05, 5]} direction={-1} color="#3b82f6" />
      <Car initialPosition={[-12.5, 0.05, 0]} direction={1} color="#eab308" />
      <Car initialPosition={[-14.5, 0.05, -10]} direction={-1} color="#a855f7" />

      {/* Sidewalks */}
      <mesh position={[-10.5, 0.08, 0]}>
        <boxGeometry args={[2, 0.1, 50]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[-16.5, 0.08, 0]}>
        <boxGeometry args={[2, 0.1, 50]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>

      {/* Animated Humanoids on sidewalk */}
      <Humanoid initialPosition={[-10.5, 0.13, -5]} offset={0} />
      <Humanoid initialPosition={[-10.5, 0.13, 5]} offset={2} />
      <Humanoid initialPosition={[-16.5, 0.13, 0]} offset={1} />
      <Humanoid initialPosition={[-16.5, 0.13, 8]} offset={3} />
      <Humanoid initialPosition={[-10.5, 0.13, -12]} offset={4} />

      {/* Visitors entering and leaving the building */}
      <VisitorHumanoid initialPosition={[-10.5, 0.13, 1]} offset={0} isLeaving={false} />
      <VisitorHumanoid initialPosition={[-10.5, 0.13, -1]} offset={4} isLeaving={false} />
      
      <VisitorHumanoid initialPosition={[-10.5, 0.13, 0]} offset={2} isLeaving={true} />
      <VisitorHumanoid initialPosition={[-10.5, 0.13, 2]} offset={6} isLeaving={true} />

      {/* Commercial Stores across the street */}
      <Store position={[-20.5, 0, 8]} color="#fcd34d" rotY={Math.PI / 2} />
      <Store position={[-20.5, 0, -2]} color="#f472b6" rotY={Math.PI / 2} />
      <Store position={[-20.5, 0, -12]} color="#2dd4bf" rotY={Math.PI / 2} />
      
      {/* Expanded Park (East) */}
      <mesh position={[14.6, 0, 0]}>
        <boxGeometry args={[10, 0.1, 24]} />
        <meshStandardMaterial color="#22c55e" roughness={0.9} />
      </mesh>
      {/* Park Pond */}
      <mesh position={[14.6, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[3.5, 3.5, 0.05, 32]} />
        <meshStandardMaterial color="#0ea5e9" transparent opacity={0.8} />
      </mesh>
      {/* Park Benches */}
      <mesh position={[11, 0.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[1, 0.2, 0.4]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      <mesh position={[18, 0.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[1, 0.2, 0.4]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      <mesh position={[14.6, 0.2, 4]} rotation={[0, 0, 0]}>
        <boxGeometry args={[1, 0.2, 0.4]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      {/* More Park Trees */}
      <Tree position={[12.6, 0.1, 5]} scale={1.2} />
      <Tree position={[16.6, 0.1, 6]} scale={1.5} />
      <Tree position={[13.6, 0.1, -6]} scale={1.1} />
      <Tree position={[15.6, 0.1, -4]} scale={0.9} />
      <Tree position={[17.6, 0.1, -8]} scale={1.3} />
      <Tree position={[11.6, 0.1, -9]} scale={1.4} />
      <Tree position={[18.6, 0.1, 9]} scale={1.2} />
    </group>
  );

  return (
    <group position={[0, buildingYOffset, 0]}>
      {core}
      {floors}
      {pillars}
      {roof}
      {compound}
      {/* Premium Floor indicators */}
      {Array.from({length: numFloors}).map((_, i) => {
        const isSelected = formData.floor === i + 1;
        return (
          <group key={`label-${i}`} position={[-3.8, i * floorHeight + 0.45, 3.8]}>
            {/* Connecting line pointing towards building */}
            <mesh position={[0.9, 0, -0.9]} rotation={[0, -Math.PI/4, 0]}>
              <boxGeometry args={[2.5, 0.02, 0.02]} />
              <meshBasicMaterial color={isSelected ? "#10b981" : "#cbd5e1"} />
            </mesh>
            
            <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
              {isSelected ? (
                <Text
                  position={[0, 0, 0]}
                  fontSize={0.7}
                  color="#10b981"
                  fontWeight="black"
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.03}
                  outlineColor="#ffffff"
                >
                  Floor {i + 1}
                </Text>
              ) : (
                <Text
                  position={[0, 0, 0]}
                  fontSize={0.55}
                  color="#475569"
                  fontWeight="bold"
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.03}
                  outlineColor="#ffffff"
                >
                  Floor {i + 1}
                </Text>
              )}
            </Billboard>
          </group>
        );
      })}
    </group>
  );
}, (prev, next) => {
  return prev.formData.floor === next.formData.floor && 
         prev.formData.facing === next.formData.facing && 
         prev.predictedPrice === next.predictedPrice;
});

export default React.memo(function Building3D({ formData, onSelectFlat, predictedPrice }) {
  const [theme, setTheme] = useState('day');
  const [weather, setWeather] = useState('clear'); // clear, rain, snow
  const [interiorTarget, setInteriorTarget] = useState(null);
  const orbitControlsRef = useRef(null);
  
  const isNight = theme === 'night';

  useEffect(() => {
    if (isNight) {
      // Light up the interior (seen through the sliding door glass)
      sharedMaterials.doorGlass.color.set('#fef08a');
      sharedMaterials.doorGlass.opacity = 0.9;
      
      // Ensure outer glass doesn't glow strangely
      sharedMaterials.flatGlassDef.color.set('#0f172a'); 
      sharedMaterials.flatGlassDef.opacity = 0.4;
      sharedMaterials.flatGlassSel.color.set('#fde047');
      sharedMaterials.flatGlassSel.opacity = 0.5;
    } else {
      sharedMaterials.doorGlass.color.set('#bae6fd');
      sharedMaterials.doorGlass.opacity = 0.3;

      sharedMaterials.flatGlassDef.color.set('#e0f2fe'); 
      sharedMaterials.flatGlassDef.opacity = 0.4;
      sharedMaterials.flatGlassSel.color.set('#34d399'); 
      sharedMaterials.flatGlassSel.opacity = 0.4;
    }
  }, [isNight]);

  useEffect(() => {
    if (weather === 'rain') {
      startRainSound();
    } else {
      stopRainSound();
    }
    // Cleanup on unmount
    return () => stopRainSound();
  }, [weather]);

  const handleSelectFlat = React.useCallback((floor, facing, subId) => {
    playClickSound();
    if (onSelectFlat) onSelectFlat(floor, facing, subId);
  }, [onSelectFlat]);

  const handleDoubleClickFlat = React.useCallback((pos, facing) => {
    playWhooshSound();
    setInteriorTarget({ pos, facing });
  }, []);

  return (
    <div className={`w-full h-[50vh] min-h-[350px] lg:h-full lg:min-h-[500px] rounded-2xl overflow-hidden border relative group cursor-grab active:cursor-grabbing shadow-inner transition-colors duration-1000 ${isNight ? 'bg-gradient-to-t from-slate-900 to-indigo-950 border-slate-800' : 'bg-gradient-to-t from-slate-300 to-sky-100 border-slate-200'}`}>
      <div className={`absolute top-4 left-4 z-10 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm text-sm font-bold pointer-events-none transition-all duration-300 group-hover:opacity-100 opacity-70 ${isNight ? 'bg-slate-900/80 text-slate-300' : 'bg-white/90 text-slate-700'}`}>
        Select Floor & Facing (Rotate & Click)
      </div>
      
      {/* Day/Night Toggle Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); playClickSound(); setTheme(isNight ? 'day' : 'night'); }}
        className={`absolute top-4 right-4 z-10 backdrop-blur-md p-2 rounded-xl shadow-md transition-all duration-300 hover:scale-110 flex items-center justify-center ${isNight ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/40 border border-indigo-500/30' : 'bg-amber-100 text-amber-600 hover:bg-amber-200 border border-amber-200'}`}
        title={`Switch to ${isNight ? 'Day' : 'Night'} Mode`}
      >
        {isNight ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
        )}
      </button>

      {/* Weather Toggle Button */}
      <button 
        onClick={(e) => { 
          e.stopPropagation(); 
          playClickSound();
          setWeather(w => w === 'clear' ? 'rain' : w === 'rain' ? 'snow' : 'clear'); 
        }}
        className={`absolute top-16 right-4 z-10 backdrop-blur-md p-2 rounded-xl shadow-md transition-all duration-300 hover:scale-110 flex items-center justify-center bg-white/80 text-sky-600 border border-sky-200`}
        title={`Current Weather: ${weather}. Click to change.`}
      >
        {weather === 'clear' ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
        ) : weather === 'rain' ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m20 17.5-6-3.5"/><path d="m4 6.5 6 3.5"/><path d="m4 17.5 6-3.5"/><path d="m20 6.5-6 3.5"/><path d="M12 22v-7"/><path d="M12 2v7"/></svg>
        )}
      </button>

      {/* Reset Camera Button for Fly-Through */}
      {interiorTarget && (
        <button 
          onClick={(e) => { e.stopPropagation(); playWhooshSound(); setInteriorTarget(null); }}
          className="absolute bottom-4 right-4 z-10 bg-rose-500/90 text-white px-4 py-2 rounded-xl shadow-lg font-bold hover:bg-rose-600 hover:scale-105 transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h6v-6"/><path d="M21 15h-6v6"/><path d="M21 3l-9 9"/><path d="M3 21l9-9"/></svg>
          Reset Camera
        </button>
      )}

      <Canvas dpr={1} camera={{ position: [40, 30, 50], fov: 45 }} performance={{ min: 0.5, max: 1 }} frameloop="always">
        <React.Suspense fallback={null}>
          <Environment resolution={128} background={false}>
            <mesh>
              <sphereGeometry args={[100, 16, 16]} />
              <meshBasicMaterial color={isNight ? "#020617" : "#e0f2fe"} side={THREE.BackSide} />
            </mesh>
          </Environment>
          
          {/* Dynamic Lighting based on Theme */}
          {isNight ? (
            <>
              <ambientLight intensity={0.2} />
              <directionalLight position={[15, 25, 20]} intensity={0.5} color="#818cf8" />
              <directionalLight position={[-15, 10, -20]} intensity={0.3} color="#4f46e5" />
              <hemisphereLight skyColor="#0f172a" groundColor="#1e293b" intensity={0.4} />
              {/* Moon Glow */}
              <pointLight position={[20, 40, 30]} intensity={1.5} color="#c7d2fe" distance={100} decay={2} />
            </>
          ) : (
            <>
              <ambientLight intensity={0.6} />
              <directionalLight position={[15, 25, 20]} intensity={2.5} color="#fffbeb" />
              <directionalLight position={[-15, 10, -20]} intensity={1.5} color="#38bdf8" />
              <hemisphereLight skyColor="#bae6fd" groundColor="#64748b" intensity={0.8} />
            </>
          )}
          <WeatherSystem type={weather} />
          <CameraController interiorTarget={interiorTarget} orbitControlsRef={orbitControlsRef} />
          
          <Building formData={formData} onSelectFlat={handleSelectFlat} onDoubleClickFlat={handleDoubleClickFlat} predictedPrice={predictedPrice} numFloors={14} />
          
          <OrbitControls 
            ref={orbitControlsRef}
            enablePan={false} 
            target={[0, 8, 0]}
            minPolarAngle={Math.PI / 8} 
            maxPolarAngle={Math.PI / 2 + 0.1} 
            minDistance={25}
            maxDistance={120}
            autoRotate={!interiorTarget}
            autoRotateSpeed={0.5}
            dampingFactor={0.05}
          />
          <Preload all />
        </React.Suspense>
      </Canvas>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.formData?.floor === nextProps.formData?.floor &&
         prevProps.formData?.facing === nextProps.formData?.facing &&
         prevProps.formData?.bedrooms === nextProps.formData?.bedrooms;
});
