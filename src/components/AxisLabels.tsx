import { Html } from '@react-three/drei';

export function AxisLabels({ fontSize = 0.8 }: { fontSize?: number }) {
  const baseSize = 12 * fontSize;
  const smallSize = 10 * fontSize;

  const containerStyle = {
    background: 'rgba(0,0,0,0.4)', // More transparent
    padding: '3px', // Less padding
    borderRadius: '4px',
    pointerEvents: 'none' as const,
    userSelect: 'none' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    fontFamily: 'monospace',
    fontSize: `${smallSize}px`, // Scaled
    lineHeight: '1.1',
    color: 'white',
    border: 'none', // No border
  };

  const labelStyle = {
    fontWeight: 'bold',
    marginBottom: '1px', // Less space
    fontSize: `${baseSize}px`, // Scaled
  };

  const vectorStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    borderLeft: '1px solid #666', // Lighter brackets
    borderRight: '1px solid #666',
    padding: '1px 3px', // Less padding
    borderRadius: '6px', // Slightly smaller radius
  };

  const renderLabel = (name: string, color: string, val: [number, number, number]) => (
    <div style={{ ...containerStyle, color }}>
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
