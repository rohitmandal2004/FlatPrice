import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Text, Environment, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const Tree = ({ position, scale = 1 }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 0.4, 0]}>
      <cylinderGeometry args={[0.05, 0.1, 0.8]} />
      <meshStandardMaterial color="#451a03" roughness={0.9} />
    </mesh>
    <mesh position={[0, 1.2, 0]}>
      <dodecahedronGeometry args={[0.6]} />
      <meshStandardMaterial color="#166534" roughness={0.8} />
    </mesh>
    <mesh position={[0.3, 1.0, 0.3]}>
      <dodecahedronGeometry args={[0.4]} />
      <meshStandardMaterial color="#15803d" roughness={0.8} />
    </mesh>
    <mesh position={[-0.3, 1.1, -0.2]}>
      <dodecahedronGeometry args={[0.5]} />
      <meshStandardMaterial color="#16a34a" roughness={0.8} />
    </mesh>
  </group>
);

const FlatSegment = ({ position, facing, floor, isSelected, onSelect }) => {
  const [hovered, setHovered] = useState(false);

  let mainColor = '#f8fafc'; 
  let accentColor = '#8c5230'; 
  let glassColor = '#e0f2fe'; 

  if (isSelected) {
    mainColor = '#10b981'; 
    accentColor = '#059669';
    glassColor = '#6ee7b7';
  } else if (hovered) {
    mainColor = '#6ee7b7';
    accentColor = '#10b981';
  }

  let rotY = 0;
  if (facing === 'East') rotY = Math.PI / 2;
  if (facing === 'West') rotY = -Math.PI / 2;
  if (facing === 'North') rotY = Math.PI;

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh 
        onClick={(e) => { e.stopPropagation(); onSelect(floor, facing); }} 
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }} 
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1.8, 0.9, 1.2]} />
        <meshPhysicalMaterial color={mainColor} roughness={0.2} metalness={0.1} clearcoat={1.0} clearcoatRoughness={0.1} />
      </mesh>

      <mesh position={[-0.8, 0, 0.65]} castShadow>
        <boxGeometry args={[0.2, 0.9, 0.1]} />
        <meshPhysicalMaterial color={accentColor} roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[0.8, 0, 0.65]} castShadow>
        <boxGeometry args={[0.2, 0.9, 0.1]} />
        <meshPhysicalMaterial color={accentColor} roughness={0.7} metalness={0.2} />
      </mesh>

      <mesh position={[0, -0.4, 0.9]} receiveShadow>
        <boxGeometry args={[1.8, 0.1, 0.6]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.8} />
      </mesh>

      {/* Advanced Glass Railings */}
      <mesh position={[0, -0.15, 1.2]}>
        <planeGeometry args={[1.8, 0.5]} />
        <meshPhysicalMaterial color={glassColor} transmission={1} opacity={1} transparent roughness={0.05} ior={1.6} thickness={1} side={THREE.DoubleSide} envMapIntensity={3} />
      </mesh>
      <mesh position={[-0.9, -0.15, 0.9]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.6, 0.5]} />
        <meshPhysicalMaterial color={glassColor} transmission={1} opacity={1} transparent roughness={0.05} ior={1.6} thickness={1} side={THREE.DoubleSide} envMapIntensity={3} />
      </mesh>
      <mesh position={[0.9, -0.15, 0.9]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.6, 0.5]} />
        <meshPhysicalMaterial color={glassColor} transmission={1} opacity={1} transparent roughness={0.05} ior={1.6} thickness={1} side={THREE.DoubleSide} envMapIntensity={3} />
      </mesh>

      {/* Sliding Door */}
      <mesh position={[0, 0.05, 0.61]}>
        <planeGeometry args={[1.2, 0.7]} />
        <meshPhysicalMaterial color="#0f172a" roughness={0.05} metalness={0.8} clearcoat={1} envMapIntensity={1.5} />
      </mesh>
    </group>
  );
};

const Building = ({ formData, onSelectFlat, numFloors = 10 }) => {
  const floors = [];
  const floorHeight = 1;
  const buildingYOffset = 1;
  const buildingHeight = numFloors * floorHeight;

  for (let i = 1; i <= numFloors; i++) {
    const y = (i - 1) * floorHeight;
    const facings = [
      { name: 'North', pos: [0, y, -1.2] },
      { name: 'South', pos: [0, y, 1.2] },
      { name: 'East', pos: [1.2, y, 0] },
      { name: 'West', pos: [-1.2, y, 0] },
    ];
    facings.forEach(face => {
      const isSelected = formData.floor === i && formData.facing === face.name;
      floors.push(
        <FlatSegment key={`${face.name}-${i}`} position={face.pos} facing={face.name} floor={i} isSelected={isSelected} onSelect={onSelectFlat} />
      );
    });
  }

  const core = (
    <group key="core" position={[0, (buildingHeight / 2) - 0.5, 0]}>
      <mesh>
        <boxGeometry args={[1.9, buildingHeight, 1.9]} />
        <meshStandardMaterial color="#64748b" roughness={0.7} />
      </mesh>
      
      {/* Louvers */}
      {Array.from({length: numFloors * 3}).map((_, i) => (
        <mesh key={`louver-${i}`} position={[0, (i * (buildingHeight/(numFloors*3))) - buildingHeight/2 + 0.15, 0]}>
          <boxGeometry args={[2.0, 0.05, 2.0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
      ))}

      {/* High-end corner glass shafts */}
      {[ [1.01, 1.01, Math.PI/4], [-1.01, 1.01, -Math.PI/4], [1.01, -1.01, -Math.PI/4], [-1.01, -1.01, Math.PI/4] ].map((pos, idx) => (
        <mesh key={`glass-${idx}`} position={[pos[0], 0, pos[1]]} rotation={[0, pos[2], 0]}>
          <planeGeometry args={[0.5, buildingHeight]} />
          <meshPhysicalMaterial color="#38bdf8" transmission={0.9} opacity={1} transparent roughness={0.1} ior={1.8} thickness={2} side={THREE.DoubleSide} emissive="#0ea5e9" emissiveIntensity={0.2} />
        </mesh>
      ))}
    </group>
  );

  const pillars = [];
  for (let px of [-1.5, 1.5]) {
    for (let pz of [-1.5, 1.5]) {
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
      <boxGeometry args={[2.0, 1, 2.0]} />
      <meshStandardMaterial color="#1e293b" roughness={0.9} />
    </mesh>
  );

  const roofY = buildingHeight - 0.5;
  const roof = (
    <group key="roof" position={[0, roofY, 0]}>
      {/* Penthouse Slab */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[4.2, 0.2, 4.2]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
      </mesh>
      {/* Decorative Outer Frame */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[4.0, 0.8, 4.0]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[3.8, 0.81, 3.8]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Roof Direction Indicators (On the outer frame) */}
      <Text position={[0, 1.1, -2.01]} rotation={[0, Math.PI, 0]} fontSize={0.5} color="#ef4444" fontWeight="bold" anchorX="center" anchorY="middle">
        NORTH
      </Text>
      <Text position={[0, 1.1, 2.01]} rotation={[0, 0, 0]} fontSize={0.5} color="#e2e8f0" fontWeight="bold" anchorX="center" anchorY="middle">
        SOUTH
      </Text>
      <Text position={[2.01, 1.1, 0]} rotation={[0, Math.PI / 2, 0]} fontSize={0.5} color="#e2e8f0" fontWeight="bold" anchorX="center" anchorY="middle">
        EAST
      </Text>
      <Text position={[-2.01, 1.1, 0]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.5} color="#e2e8f0" fontWeight="bold" anchorX="center" anchorY="middle">
        WEST
      </Text>

      {/* Swimming Pool */}
      <mesh position={[1, 0.72, 1]}>
        <boxGeometry args={[1.5, 0.05, 2]} />
        <meshPhysicalMaterial color="#06b6d4" transmission={0.9} roughness={0.1} ior={1.33} thickness={0.5} emissive="#0891b2" emissiveIntensity={0.3} />
      </mesh>
      <Sparkles position={[1, 1.2, 1]} count={40} scale={2.5} size={2} color="#67e8f9" speed={0.4} opacity={0.6} />
      <mesh position={[1, 0.7, 1]}>
        <boxGeometry args={[1.6, 0.1, 2.1]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[1, 0.71, 1]}>
        <boxGeometry args={[1.4, 0.02, 1.9]} />
        <meshStandardMaterial color="#38bdf8" />
      </mesh>

      {/* Helipad */}
      <mesh position={[-1, 0.71, -1]}>
        <cylinderGeometry args={[0.8, 0.8, 0.05, 32]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {/* Glowing ring around helipad */}
      <mesh position={[-1, 0.74, -1]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.75, 32]} />
        <meshBasicMaterial color="#ef4444" side={THREE.DoubleSide} />
      </mesh>
      {/* H Marker */}
      <mesh position={[-1.0, 0.712, -0.8]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[0.1, 0.6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.6, 0.712, -0.8]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[0.1, 0.6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.8, 0.712, -0.8]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[0.3, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
  
  const compound = (
    <group key="compound" position={[0, -1, 0]}>
      {/* Lush Green Lawn */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[14, 0.1, 14]} />
        <meshStandardMaterial color="#4ade80" roughness={0.9} />
      </mesh>

      {/* Asphalt Driveway */}
      <mesh position={[-4.0, 0.06, 0]}>
        <boxGeometry args={[6.0, 0.05, 2.5]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
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
      <mesh position={[0, 0.4, 6.9]}>
        <boxGeometry args={[14, 0.8, 0.2]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <mesh position={[0, 0.4, -6.9]}>
        <boxGeometry args={[14, 0.8, 0.2]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <mesh position={[6.9, 0.4, 0]}>
        <boxGeometry args={[0.2, 0.8, 14]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      {/* Front Wall with Gate Gap */}
      <mesh position={[-6.9, 0.4, -4.5]}>
        <boxGeometry args={[0.2, 0.8, 5]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <mesh position={[-6.9, 0.4, 4.5]}>
        <boxGeometry args={[0.2, 0.8, 5]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      {/* Sleek Dark Gate */}
      <mesh position={[-6.9, 0.4, -1]}>
        <boxGeometry args={[0.05, 0.8, 2]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} />
      </mesh>
      <mesh position={[-6.9, 0.4, 1]}>
        <boxGeometry args={[0.05, 0.8, 2]} />
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

      {/* Trees */}
      <Tree position={[4.5, 0.1, 4.5]} scale={1.2} />
      <Tree position={[4.8, 0.1, -4.8]} scale={0.9} />
      <Tree position={[-4.5, 0.1, 4.8]} scale={1.1} />
      <Tree position={[-4.5, 0.1, -4.5]} scale={1.3} />
      <Tree position={[0, 0.1, 6.2]} scale={0.8} />
      <Tree position={[0, 0.1, -6.2]} scale={1.0} />
      <Tree position={[6.2, 0.1, 0]} scale={1.0} />
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
          <group key={`label-${i}`} position={[-2.4, i * floorHeight, 0]}>
            {/* Connecting line */}
            <mesh position={[0.4, 0, 0]}>
              <boxGeometry args={[0.8, 0.02, 0.02]} />
              <meshBasicMaterial color={isSelected ? "#10b981" : "#94a3b8"} />
            </mesh>
            
            {isSelected ? (
              <Float speed={3} rotationIntensity={0} floatIntensity={1} floatingRange={[-0.1, 0.1]}>
                <Text
                  position={[-0.2, 0, 0]}
                  fontSize={0.4}
                  color="#10b981"
                  fontWeight="bold"
                  anchorX="right"
                  anchorY="middle"
                  outlineWidth={0.02}
                  outlineColor="#ffffff"
                >
                  Floor {i + 1}
                </Text>
              </Float>
            ) : (
              <Text
                position={[-0.2, 0, 0]}
                fontSize={0.35}
                color="#475569"
                fontWeight="bold"
                anchorX="right"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#ffffff"
              >
                Floor {i + 1}
              </Text>
            )}
          </group>
        );
      })}
    </group>
  );
};

export default function Building3D({ formData, onSelectFlat }) {
  return (
    <div className="w-full h-full min-h-[500px] bg-gradient-to-t from-slate-300 to-sky-100 rounded-2xl overflow-hidden border border-slate-200 relative group cursor-grab active:cursor-grabbing shadow-inner">
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm text-sm font-bold text-slate-700 pointer-events-none transition-opacity group-hover:opacity-100 opacity-70">
        Select Floor & Facing (Rotate & Click)
      </div>
      <Canvas shadows camera={{ position: [18, 16, 24], fov: 40 }}>
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
            shadow-camera-far={50} 
            shadow-camera-left={-20} 
            shadow-camera-right={20} 
            shadow-camera-top={20} 
            shadow-camera-bottom={-20} 
          />
          <directionalLight position={[-15, 10, -20]} intensity={1.5} color="#38bdf8" />
          <directionalLight position={[15, 5, -20]} intensity={1} color="#818cf8" />
          <hemisphereLight skyColor="#bae6fd" groundColor="#3b82f6" intensity={0.8} />
          <Sparkles count={150} scale={25} size={1.5} speed={0.2} opacity={0.3} color="#ffffff" />
          
          <Building formData={formData} onSelectFlat={onSelectFlat} numFloors={10} />
          
          <ContactShadows position={[0, -0.99, 0]} opacity={0.7} scale={30} blur={2.5} far={4} color="#0f172a" />
          
          <OrbitControls 
            enablePan={false} 
            target={[0, 4, 0]}
            minPolarAngle={Math.PI / 8} 
            maxPolarAngle={Math.PI / 2 - 0.05} 
            minDistance={10}
            maxDistance={40}
            autoRotate
            autoRotateSpeed={0.4}
          />
        </React.Suspense>
      </Canvas>
    </div>
  );
}
