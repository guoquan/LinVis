import { useState, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { VectorArrow } from './components/VectorArrow';
import { Sidebar } from './components/Sidebar';
import { SpanVisualizer } from './components/SpanVisualizer';
import { ProjectionLine } from './components/ProjectionLine';
import { AxisLabels } from './components/AxisLabels';
import { type Vector3 } from './utils/linearAlgebra';
import './App.css';

// Define color constants for better visibility on projectors
export const BASIS_VECTOR_COLOR = '#00FFFF'; // Aqua / Cyan
export const TARGET_VECTOR_COLOR = '#FF4500'; // OrangeRed
export const SPAN_VIS_COLOR = '#FF00FF';     // Fuchsia / Magenta

interface SceneProps {
  vectors: Vector3[];
  target: Vector3;
  autoRotate: boolean;
  resetTrigger: number;
}

function Scene({ vectors, target, autoRotate, resetTrigger }: SceneProps) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  // Reset Camera Effect
  useEffect(() => {
    if (resetTrigger > 0) {
        // Reset position and orientation (Z-up)
        camera.up.set(0, 0, 1);
        camera.position.set(6, 6, 4);
        camera.lookAt(0, 0, 0);
        
        // Reset controls
        if (controlsRef.current) {
            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.update();
        }
    }
  }, [resetTrigger, camera]);

  return (
    <>
      <OrbitControls 
        ref={controlsRef}
        makeDefault 
        autoRotate={autoRotate} 
        autoRotateSpeed={2.0}
      />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <axesHelper args={[5]} />
      <AxisLabels />
      
      {/* Basis Vectors */}
      {vectors.map((v, i) => (
        <VectorArrow 
          key={i} 
          end={v} 
          color={BASIS_VECTOR_COLOR} 
          label={`v${i+1}`} 
        />
      ))}
      
      {/* Target Vector */}
      <VectorArrow 
        end={target} 
        color={TARGET_VECTOR_COLOR} 
        label="target" 
      />
      
      {/* Span Visualization */}
      <SpanVisualizer vectors={vectors} color={SPAN_VIS_COLOR} />

      {/* Projection Line for Target Vector */}
      <ProjectionLine basisVectors={vectors} targetVector={target} />
    </>
  );
}

function App() {
  const [vectors, setVectors] = useState<Vector3[]>([
    [2, 0, 0], 
    [0, 2, 0]
  ]);
  const [targetVector, setTargetVector] = useState<Vector3>([1, 1, 1]);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', overflow: 'hidden' }}>
      {/* 3D Viewport */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas camera={{ position: [6, 6, 4], fov: 50, up: [0, 0, 1] }}>
          <color attach="background" args={['#1a1a1a']} />
          <Scene 
            vectors={vectors} 
            target={targetVector} 
            autoRotate={autoRotate}
            resetTrigger={resetTrigger}
          />
        </Canvas>
        
        <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', pointerEvents: 'none', fontFamily: 'sans-serif' }}>
          <h1 style={{ margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Linear Algebra Vis</h1>
        </div>
      </div>
      
      {/* Sidebar */}
      <div style={{ width: '320px', height: '100%' }}>
         <Sidebar 
            vectors={vectors} 
            setVectors={setVectors} 
            targetVector={targetVector} 
            setTargetVector={setTargetVector}
            autoRotate={autoRotate}
            onToggleRotate={() => setAutoRotate(!autoRotate)}
            onResetView={() => setResetTrigger(t => t + 1)}
         />
      </div>
    </div>
  );
}

export default App;
