import { Html } from '@react-three/drei';

export function AxisLabels() {
  const containerStyle = {
    background: 'rgba(0,0,0,0.8)', // Increased opacity
    padding: '5px', // Slightly more padding
    borderRadius: '4px',
    pointerEvents: 'none' as const,
    userSelect: 'none' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    fontFamily: 'monospace',
    fontSize: '14px', // Increased font size
    lineHeight: '1.2',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.2)',
  };

  const labelStyle = {
    fontWeight: 'bold',
    marginBottom: '3px', // More space
    fontSize: '16px', // Increased font size
  };

  const vectorStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    borderLeft: '1px solid #aaa',
    borderRight: '1px solid #aaa',
    padding: '0 5px', // More padding
    borderRadius: '4px', // slightly curved brackets look
  };

  const renderLabel = (name: string, color: string, val: [number, number, number]) => (
    <div style={{ ...containerStyle, borderColor: color }}>
      <div style={{ ...labelStyle, color }}>{name}</div>
      <div style={vectorStyle}>
        {val.map((n, i) => <span key={i}>{n}</span>)}
      </div>
    </div>
  );

  return (
    <group>
      {/* X Axis Label (Red) */}
      <Html position={[5.5, 0, 0]} center>
        {renderLabel('X', '#ff6666', [1, 0, 0])}
      </Html>
      
      {/* Y Axis Label (Green) */}
      <Html position={[0, 5.5, 0]} center>
        {renderLabel('Y', '#66ff66', [0, 1, 0])}
      </Html>
      
      {/* Z Axis Label (Blue) */}
      <Html position={[0, 0, 5.5]} center>
        {renderLabel('Z', '#6666ff', [0, 0, 1])}
      </Html>
    </group>
  );
}
