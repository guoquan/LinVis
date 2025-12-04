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

  // Visual configuration (Fixed thickness for consistency)
  const headLength = 0.4; 
  const headWidth = 0.2; 
  const shaftLength = Math.max(0, length - headLength);
  const shaftRadius = 0.04; 

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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '10px',
            pointerEvents: 'none',
            userSelect: 'none',
          }}>
            <div style={{ 
                color: color, 
                fontWeight: 'bold', 
                marginBottom: '2px',
                background: 'rgba(0,0,0,0.6)',
                padding: '0 4px',
                borderRadius: '2px',
                fontSize: '14px'
            }}>{label}</div>
            
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderLeft: `2px solid ${color}`,
                borderRight: `2px solid ${color}`,
                borderRadius: '8px', // Brackets look
                padding: '2px 6px',
                background: 'rgba(0,0,0,0.7)',
                fontFamily: 'monospace',
                color: '#fff',
                fontSize: '12px',
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
