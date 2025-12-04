import { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

interface VectorArrowProps {
  start?: [number, number, number];
  end: [number, number, number];
  color?: string; // Will be BASIS_VECTOR_COLOR or TARGET_VECTOR_COLOR
  label?: string;
}

export function VectorArrow({ start = [0, 0, 0], end, color = '#00FFFF', label }: VectorArrowProps) {
  const startVec = useMemo(() => new THREE.Vector3(...start), [start]);
  const endVec = useMemo(() => new THREE.Vector3(...end), [end]);
  
  const { length, quaternion } = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(endVec, startVec);
    const len = dir.length();
    
    if (len < 0.0001) {
        return { length: 0, quaternion: new THREE.Quaternion() };
    }

    const defaultDir = new THREE.Vector3(0, 1, 0);
    const targetDir = dir.clone().normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(defaultDir, targetDir);
    
    return { length: len, quaternion: quat };
  }, [startVec, endVec]);

  if (length < 0.0001) return null;

  // Visual configuration (refined thickness)
  const headLength = Math.min(length * 0.2, 0.6); 
  const headWidth = Math.min(headLength * 0.5, 0.3); 
  const shaftLength = length - headLength;
  const shaftRadius = Math.max(headWidth * 0.3, 0.03); 

  return (
    <group position={start} quaternion={quaternion}>
      {/* Shaft */}
      <mesh position={[0, shaftLength / 2, 0]}>
        <cylinderGeometry args={[shaftRadius, shaftRadius, shaftLength, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Head */}
      <mesh position={[0, shaftLength + headLength / 2, 0]}>
        <coneGeometry args={[headWidth, headLength, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Label */}
      {label && (
        <Html position={[0, length + 0.2, 0]} center zIndexRange={[100, 0]}>
          <div style={{ 
            color: color, 
            background: 'rgba(0,0,0,0.8)', // Increased opacity
            padding: '5px', 
            borderRadius: '4px',
            fontSize: '14px', // Increased font size
            fontFamily: 'monospace',
            pointerEvents: 'none',
            userSelect: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: `1px solid ${color}`,
            minWidth: '30px',
            marginBottom: '10px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{label}</div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderLeft: '1px solid #aaa',
                borderRight: '1px solid #aaa',
                padding: '0 4px',
                lineHeight: '1.2'
            }}>
               <span>{parseFloat((end[0] - start[0]).toFixed(2))}</span>
               <span>{parseFloat((end[1] - start[1]).toFixed(2))}</span>
               <span>{parseFloat((end[2] - start[2]).toFixed(2))}</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
