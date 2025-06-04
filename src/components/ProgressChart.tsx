import { useMemo } from "react";

interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

interface ProgressChartProps {
  data: DataPoint[];
  title: string;
  color: string;
  type?: "line" | "bar";
  height?: number;
}

export function ProgressChart({ 
  data, 
  title, 
  color, 
  type = "line", 
  height = 200 
}: ProgressChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    return data.map((point, index) => ({
      ...point,
      x: (index / (data.length - 1)) * 100,
      y: ((maxValue - point.value) / range) * 80 + 10, // 10% padding top/bottom
      normalizedValue: ((point.value - minValue) / range) * 100
    }));
  }, [data]);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-800 mb-4">{title}</h4>
        <div className="flex items-center justify-center h-32 text-gray-500">
          <div className="text-center">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm">No data available yet</p>
          </div>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h4 className="font-medium text-gray-800 mb-4">{title}</h4>
      
      <div className="relative" style={{ height: `${height}px` }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          
          {type === "line" ? (
            <>
              {/* Area under the line */}
              <path
                d={`M 0 100 ${chartData.map(point => `L ${point.x} ${point.y}`).join(' ')} L 100 100 Z`}
                fill={color.replace('bg-', '')}
                fillOpacity="0.1"
              />
              
              {/* Line */}
              <path
                d={`M ${chartData[0].x} ${chartData[0].y} ${chartData.slice(1).map(point => `L ${point.x} ${point.y}`).join(' ')}`}
                fill="none"
                stroke={color.replace('bg-', '')}
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              
              {/* Data points */}
              {chartData.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r="1.5"
                  fill={color.replace('bg-', '')}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </>
          ) : (
            /* Bar chart */
            chartData.map((point, index) => (
              <rect
                key={index}
                x={point.x - 2}
                y={point.y}
                width="4"
                height={100 - point.y}
                fill={color.replace('bg-', '')}
                fillOpacity="0.8"
              />
            ))
          )}
        </svg>
        
        {/* Data labels */}
        <div className="absolute inset-0 pointer-events-none">
          {chartData.map((point, index) => (
            <div
              key={index}
              className="absolute transform -translate-x-1/2"
              style={{
                left: `${point.x}%`,
                bottom: `${100 - point.y}%`,
              }}
            >
              <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 hover:opacity-100 transition-opacity">
                {point.date}: {point.value}
                {point.label && <div className="text-gray-300">{point.label}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-4 text-xs text-gray-600">
        <span>{chartData[0]?.date}</span>
        <span className="text-center">
          Max: {maxValue}
        </span>
        <span>{chartData[chartData.length - 1]?.date}</span>
      </div>
    </div>
  );
}
