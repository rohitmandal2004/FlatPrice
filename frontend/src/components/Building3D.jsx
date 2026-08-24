import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Text, Environment, Float, Sparkles, Billboard } from '@react-three/drei';
import * as THREE from 'three';

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
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.8, 0.4, 1.8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 0.65, -0.1]}>
        <boxGeometry args={[0.7, 0.3, 1]} />
        <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.8} />
      </mesh>
      {/* Wheels */}
      {[-0.45, 0.45].map((x) => 
        [-0.6, 0.6].map((z) => (
          <mesh key={`wheel-${x}-${z}`} position={[x, 0.15, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
            <meshStandardMaterial color="#111" roughness={0.9} />
          </mesh>
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
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.4]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.15]} />
        <meshStandardMaterial color="#fcd34d" />
      </mesh>
    </group>
  );
};

const Store = ({ position, color, rotY = 0 }) => (
  <group position={position} rotation={[0, rotY, 0]}>
    <mesh position={[0, 1.5, 0]}>
      <boxGeometry args={[4, 3, 3]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
    {/* Glass Front */}
    <mesh position={[0, 1.2, 1.51]}>
      <planeGeometry args={[3, 1.8]} />
      <meshPhysicalMaterial color="#38bdf8" transmission={0.9} transparent opacity={1} roughness={0.1} />
    </mesh>
    {/* Awning */}
    <mesh position={[0, 2.2, 1.9]} rotation={[-Math.PI / 6, 0, 0]}>
      <boxGeometry args={[3.8, 0.1, 1]} />
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
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.4]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.15]} />
        <meshStandardMaterial color="#fcd34d" />
      </mesh>
    </group>
  );
};

const House = ({ position, color, rotY = 0, floors = 1 }) => {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Base(s) */}
      {Array.from({length: floors}).map((_, i) => (
        <mesh key={`floor-${i}`} position={[0, 0.5 + i * 1, 0]}>
          <boxGeometry args={[3, 1, 3]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
      {/* Roof */}
      <mesh position={[0, 1.3 + (floors - 1) * 1, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[2.5, 1, 4]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>
      {/* Door */}
      <mesh position={[0, 0.4, 1.51]}>
        <boxGeometry args={[0.6, 0.8, 0.05]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
};

const Tree = ({ position, scale = 1 }) => {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 0.8]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <coneGeometry args={[0.8, 1.5, 8]} />
        <meshStandardMaterial color="#15803d" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.8, 0]}>
        <coneGeometry args={[0.6, 1.2, 8]} />
        <meshStandardMaterial color="#166534" roughness={0.9} />
      </mesh>
    </group>
  );
};

const FlatSegment = ({ position, facing, floor, isSelected, onSelect, width = 2.7 }) => {
  const [hovered, setHovered] = useState(false);

  let mainColor = '#475569'; // Slate 600 (Darker building walls)
  let accentColor = '#0f172a'; // Slate 900
  let glassColor = '#e0f2fe'; 

  if (isSelected) {
    mainColor = '#064e3b'; // Emerald 900 (Darker selection color)
    accentColor = '#022c22';
    glassColor = '#34d399';
  } else if (hovered) {
    mainColor = '#047857'; // Emerald 700 (Darker hover color)
    accentColor = '#064e3b';
  }

  let rotY = 0;
  if (facing === 'East') rotY = Math.PI / 2;
  if (facing === 'West') rotY = -Math.PI / 2;
  if (facing === 'North') rotY = Math.PI;

  const halfWidth = width / 2;

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Main Room Structure (Hollow for interior view) */}
      <group
        onClick={(e) => { e.stopPropagation(); onSelect(); }} 
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }} 
        onPointerOut={() => setHovered(false)}
      >
        {/* Back Wall */}
        <mesh position={[0, 0, -0.55]}>
          <boxGeometry args={[width - 0.2, 0.9, 0.1]} />
          <meshStandardMaterial color={mainColor} roughness={0.5} />
        </mesh>
        {/* Floor */}
        <mesh position={[0, -0.4, 0]}>
          <boxGeometry args={[width - 0.2, 0.1, 1.0]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
        </mesh>
        {/* Ceiling */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[width - 0.2, 0.1, 1.0]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.9} />
        </mesh>
        {/* Left Wall */}
        <mesh position={[-halfWidth + 0.05, 0, 0]}>
          <boxGeometry args={[0.1, 0.9, 1.0]} />
          <meshStandardMaterial color={mainColor} roughness={0.5} />
        </mesh>
        {/* Right Wall */}
        <mesh position={[halfWidth - 0.05, 0, 0]}>
          <boxGeometry args={[0.1, 0.9, 1.0]} />
          <meshStandardMaterial color={mainColor} roughness={0.5} />
        </mesh>
        
        {/* Interior Furniture (TV & Sofa) */}
        {/* Glowing TV on the back wall */}
        <mesh position={[0, 0.1, -0.48]}>
          <planeGeometry args={[1.2, 0.6]} />
          <meshStandardMaterial color="#000000" emissive="#38bdf8" emissiveIntensity={0.5} />
        </mesh>
        {/* Sofa */}
        <mesh position={[0, -0.25, -0.1]}>
          <boxGeometry args={[1.4, 0.2, 0.5]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>

      {/* Balcony Base */}
      <mesh position={[0, -0.4, 0.9]} receiveShadow castShadow>
        <boxGeometry args={[width, 0.1, 0.6]} />
        <meshStandardMaterial color={mainColor} roughness={0.8} />
      </mesh>

      {/* Premium White Trim (Makes floor separation clearly visible) */}
      <mesh position={[0, -0.4, 1.22]} receiveShadow castShadow>
        <boxGeometry args={[width + 0.02, 0.12, 0.05]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Advanced Glass Railings (Optimized for Smooth FPS) */}
      <mesh position={[0, -0.15, 1.21]}>
        <planeGeometry args={[width, 0.5]} />
        <meshStandardMaterial color={glassColor} transparent opacity={0.4} roughness={0.1} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-halfWidth - 0.01, -0.15, 0.9]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.6, 0.5]} />
        <meshStandardMaterial color={glassColor} transparent opacity={0.4} roughness={0.1} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[halfWidth + 0.01, -0.15, 0.9]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.6, 0.5]} />
        <meshStandardMaterial color={glassColor} transparent opacity={0.4} roughness={0.1} side={THREE.DoubleSide} />
      </mesh>

      {/* Upgraded Transparent Sliding Door */}
      <group position={[0, 0.05, 0.62]}>
        {/* Left Frame */}
        <mesh position={[-width * 0.3 + 0.025, 0, 0]}>
          <boxGeometry args={[0.05, 0.7, 0.05]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* Right Frame */}
        <mesh position={[width * 0.3 - 0.025, 0, 0]}>
          <boxGeometry args={[0.05, 0.7, 0.05]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* Top Frame */}
        <mesh position={[0, 0.35 - 0.025, 0]}>
          <boxGeometry args={[width * 0.6, 0.05, 0.05]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* Glass Window Pane */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[width * 0.6, 0.7]} />
          <meshStandardMaterial color="#bae6fd" transparent opacity={0.3} roughness={0.1} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
};

const Building = ({ formData, onSelectFlat, numFloors = 14 }) => {
  const [selectedSubId, setSelectedSubId] = useState(null);

  const handleSelect = (floor, facing, subId) => {
    setSelectedSubId(subId);
    onSelectFlat(floor, facing);
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
        <meshPhysicalMaterial color="#06b6d4" transmission={0.9} roughness={0.1} ior={1.33} thickness={0.5} emissive="#0891b2" emissiveIntensity={0.3} />
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
          <meshPhysicalMaterial color="#0284c7" transmission={0.9} ior={1.33} />
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
          <meshPhysicalMaterial color="#0ea5e9" transmission={0.9} ior={1.33} />
        </mesh>
      </group>

      {/* Outer Road (Front) */}
      <mesh position={[-12, 0.05, 0]}>
        <boxGeometry args={[4, 0.05, 50]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
      {/* Dashed line */}
      {Array.from({length: 25}).map((_, i) => (
        <mesh key={`dash-${i}`} position={[-12, 0.08, -24 + (i * 2)]}>
          <boxGeometry args={[0.1, 0.01, 1]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
      
      {/* Animated Cars */}
      <Car initialPosition={[-11, 0.05, -15]} direction={1} color="#ef4444" />
      <Car initialPosition={[-13, 0.05, 5]} direction={-1} color="#3b82f6" />
      <Car initialPosition={[-11, 0.05, 0]} direction={1} color="#eab308" />
      <Car initialPosition={[-13, 0.05, -10]} direction={-1} color="#a855f7" />

      {/* Sidewalks */}
      <mesh position={[-9, 0.08, 0]}>
        <boxGeometry args={[2, 0.1, 50]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[-15, 0.08, 0]}>
        <boxGeometry args={[2, 0.1, 50]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>

      {/* Animated Humanoids on sidewalk */}
      <Humanoid initialPosition={[-9, 0.13, -5]} offset={0} />
      <Humanoid initialPosition={[-9, 0.13, 5]} offset={2} />
      <Humanoid initialPosition={[-15, 0.13, 0]} offset={1} />
      <Humanoid initialPosition={[-15, 0.13, 8]} offset={3} />
      <Humanoid initialPosition={[-9, 0.13, -12]} offset={4} />

      {/* Visitors entering and leaving the building */}
      <VisitorHumanoid initialPosition={[-9, 0.13, 1]} offset={0} isLeaving={false} />
      <VisitorHumanoid initialPosition={[-9, 0.13, -1]} offset={4} isLeaving={false} />
      
      <VisitorHumanoid initialPosition={[-9, 0.13, 0]} offset={2} isLeaving={true} />
      <VisitorHumanoid initialPosition={[-9, 0.13, 2]} offset={6} isLeaving={true} />

      {/* Commercial Stores across the street */}
      <Store position={[-18, 0, 8]} color="#fcd34d" rotY={Math.PI / 2} />
      <Store position={[-18, 0, -2]} color="#f472b6" rotY={Math.PI / 2} />
      <Store position={[-18, 0, -12]} color="#2dd4bf" rotY={Math.PI / 2} />
      
      {/* Expanded Park (East) */}
      <mesh position={[12, 0, 0]}>
        <boxGeometry args={[10, 0.1, 24]} />
        <meshStandardMaterial color="#22c55e" roughness={0.9} />
      </mesh>
      {/* Park Pond */}
      <mesh position={[12, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[3.5, 3.5, 0.05, 32]} />
        <meshPhysicalMaterial color="#0ea5e9" transmission={0.9} ior={1.33} />
      </mesh>
      {/* Park Benches */}
      <mesh position={[8, 0.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[1, 0.2, 0.4]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      <mesh position={[16, 0.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[1, 0.2, 0.4]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      <mesh position={[12, 0.2, 4]} rotation={[0, 0, 0]}>
        <boxGeometry args={[1, 0.2, 0.4]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      {/* More Park Trees */}
      <Tree position={[10, 0.1, 5]} scale={1.2} />
      <Tree position={[14, 0.1, 6]} scale={1.5} />
      <Tree position={[11, 0.1, -6]} scale={1.1} />
      <Tree position={[13, 0.1, -4]} scale={0.9} />
      <Tree position={[15, 0.1, -8]} scale={1.3} />
      <Tree position={[9, 0.1, -9]} scale={1.4} />
      <Tree position={[16, 0.1, 9]} scale={1.2} />
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
                <Float speed={3} rotationIntensity={0} floatIntensity={1} floatingRange={[-0.1, 0.1]}>
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
                </Float>
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
};

export default function Building3D({ formData, onSelectFlat }) {
  return (
    <div className="w-full h-[50vh] min-h-[350px] lg:h-full lg:min-h-[500px] bg-gradient-to-t from-slate-300 to-sky-100 rounded-2xl overflow-hidden border border-slate-200 relative group cursor-grab active:cursor-grabbing shadow-inner">
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm text-sm font-bold text-slate-700 pointer-events-none transition-opacity group-hover:opacity-100 opacity-70">
        Select Floor & Facing (Rotate & Click)
      </div>
      <Canvas shadows camera={{ position: [40, 30, 50], fov: 45 }}>
        <React.Suspense fallback={null}>
          <Environment resolution={256} background={false}>
            <mesh>
              <sphereGeometry args={[100, 16, 16]} />
              <meshBasicMaterial color="#e0f2fe" side={THREE.BackSide} />
            </mesh>
          </Environment>
          {/* Dramatic Lighting & Global Atmosphere */}
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[15, 25, 20]} 
            intensity={2.5} 
            color="#fffbeb"
            castShadow 
            shadow-mapSize={[2048, 2048]} 
            shadow-camera-far={60} 
            shadow-camera-left={-25} 
            shadow-camera-right={25} 
            shadow-camera-top={25} 
            shadow-camera-bottom={-25} 
            shadow-bias={-0.0005}
          />
          <directionalLight position={[-15, 10, -20]} intensity={1.5} color="#38bdf8" />
          <directionalLight position={[15, 5, -20]} intensity={1} color="#818cf8" />
          <hemisphereLight skyColor="#bae6fd" groundColor="#64748b" intensity={0.8} />
          <Sparkles count={150} scale={25} size={1.5} speed={0.2} opacity={0.3} color="#ffffff" />
          
          <Building formData={formData} onSelectFlat={onSelectFlat} numFloors={14} />
          
          <ContactShadows position={[0, -0.99, 0]} opacity={0.7} scale={50} blur={2.5} far={4} color="#0f172a" frames={1} resolution={512} />
          
          <OrbitControls 
            enablePan={false} 
            target={[0, 8, 0]}
            minPolarAngle={Math.PI / 8} 
            maxPolarAngle={Math.PI / 2 + 0.1} 
            minDistance={25}
            maxDistance={120}
            autoRotate
            autoRotateSpeed={0.4}
            enableDamping={true}
            dampingFactor={0.05}
          />
        </React.Suspense>
      </Canvas>
    </div>
  );
}
