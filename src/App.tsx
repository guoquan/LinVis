import { useState, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { VectorArrow } from './components/VectorArrow';
import { Sidebar } from './components/Sidebar';
import { SpanVisualizer } from './components/SpanVisualizer';
import { ProjectionLine } from './components/ProjectionLine';
import { CoordinateVisualizer } from './components/CoordinateVisualizer';
import { AxisLabels } from './components/AxisLabels';
import { type Vector3 } from './utils/linearAlgebra';
import { useLanguage } from './hooks/useLanguage';
import { BASIS_VECTOR_COLOR, SPAN_VIS_COLOR, TARGET_COLORS } from './constants/colors';
import './App.css';

interface SceneProps {
  vectors: Vector3[];
  targetVectors: Vector3[];
  autoRotate: boolean;
  resetTrigger: number;
  showCoordinates: boolean;
  fontSize: number; // Add fontSize prop
}

function Scene({ vectors, targetVectors, autoRotate, resetTrigger, showCoordinates, fontSize }: SceneProps) {
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
      
      
      {/* Thick Axes for Projector Visibility */}
      <ThickAxes length={5} thickness={0.02} /> {/* Further reduced thickness */}
      <AxisLabels fontSize={fontSize} />
      
      {/* Basis Vectors */}
      {vectors.map((v, i) => (
        <VectorArrow 
          key={`basis-${i}`} 
          end={v} 
          color={BASIS_VECTOR_COLOR} 
          label={`v${i+1}`} 
          fontSize={fontSize}
        />
      ))}
      
      {/* Target Vectors */}
      {targetVectors.map((v, i) => {
         const color = TARGET_COLORS[i % TARGET_COLORS.length];
         return (
            <group key={`target-${i}`}>
                <VectorArrow 
                  end={v} 
                  color={color} 
                  label={`b${i+1}`} 
                  fontSize={fontSize}
                />
                <ProjectionLine 
                  basisVectors={vectors} 
                  targetVector={v} 
                  color={color}
                />
                {showCoordinates && (
                  <CoordinateVisualizer 
                    basisVectors={vectors} 
                    targetVector={v} 
                    color={color} 
                    fontSize={fontSize} // Pass fontSize
                  />
                )}
            </group>
         );
      })}
      
      {/* Span Visualization */}
      <SpanVisualizer vectors={vectors} color={SPAN_VIS_COLOR} />
    </>
  );
}

// Custom Thick Axes Component
function ThickAxes({ length, thickness }: { length: number, thickness: number }) {
    return (
        <group>
            {/* X Axis (Replaced Red with Gold/Yellow for projector safety) */}
            <mesh position={[length/2, 0, 0]} rotation={[0, 0, -Math.PI/2]}>
                <cylinderGeometry args={[thickness, thickness, length, 16]} />
                <meshBasicMaterial color="#FFD700" />
            </mesh>
            {/* Y Axis (Bright Green) */}
            <mesh position={[0, length/2, 0]}>
                <cylinderGeometry args={[thickness, thickness, length, 16]} />
                <meshBasicMaterial color="#39FF14" />
            </mesh>
            {/* Z Axis (Bright Blue) */}
            <mesh position={[0, 0, length/2]} rotation={[Math.PI/2, 0, 0]}>
                <cylinderGeometry args={[thickness, thickness, length, 16]} />
                <meshBasicMaterial color="#1E90FF" />
            </mesh>
        </group>
    );
}

function App() {
  useLanguage();
  const [vectors, setVectors] = useState<Vector3[]>([
    [2, 0, 0], 
    [0, 2, 0]
  ]);
  const [targetVectors, setTargetVectors] = useState<Vector3[]>([[1, 1, 1]]);
  const [autoRotate, setAutoRotate] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [fontSize, setFontSize] = useState(0.8); // Default font size
  const [resetTrigger, setResetTrigger] = useState(0);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 600;
      setIsMobile(mobile);
      // If switching to desktop, ensure sidebar is effectively "open" (visible)
      // We don't need to set isSidebarOpen(true) because we handle transform logic below
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="app-container">
      {/* Mobile Menu Button */}
      <button 
        className="menu-btn"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open Settings"
        style={{ display: isMobile ? 'block' : 'none' }}
      >
        ☰
      </button>

      {/* 3D Viewport */}
      <div className="canvas-container">
        <Canvas camera={{ position: [6, 6, 4], fov: 35, up: [0, 0, 1] }}>
          <color attach="background" args={['#1a1a1a']} />
          <Scene 
            vectors={vectors} 
            targetVectors={targetVectors} 
            autoRotate={autoRotate}
            showCoordinates={showCoordinates}
            resetTrigger={resetTrigger}
            fontSize={fontSize}
          />
        </Canvas>
        
        <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', pointerEvents: 'none', fontFamily: 'sans-serif', zIndex: 10 }}>
          <h1 style={{ margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)', fontSize: '24px' }}>LinVis</h1>
        </div>
        
        {/* Overlay for mobile */}
        <div 
          className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} 
          onClick={() => setSidebarOpen(false)}
        />
      </div>
      
      {/* Sidebar */}
      <div 
        className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}
        style={{
             transform: !isMobile ? 'none' : (isSidebarOpen ? 'translateX(0)' : 'translateX(100%)'),
             position: !isMobile ? 'relative' : 'absolute' // Ensure correct positioning
        }}
      >
         <Sidebar 
            vectors={vectors} 
            setVectors={setVectors} 
            targetVectors={targetVectors} 
            setTargetVectors={setTargetVectors}
            autoRotate={autoRotate}
            onToggleRotate={() => setAutoRotate(!autoRotate)}
            showCoordinates={showCoordinates}
            onToggleCoordinates={() => setShowCoordinates(!showCoordinates)}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            onResetView={() => setResetTrigger(t => t + 1)}
            onClose={() => setSidebarOpen(false)}
         />
      </div>
    </div>
  );
}

export default App;
