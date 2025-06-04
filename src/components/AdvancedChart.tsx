import { useMemo } from "react";

interface DataPoint {
  date: string;
  value: number;
  label?: string;
  category?: string;
}

interface AdvancedChartProps {
  data: DataPoint[];
  title: string;
  type: "line" | "bar" | "area";
  color: string;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  animate?: boolean;
}

export function AdvancedChart({ 
  data, 
  title, 
  type = "line", 
  color, 
  height = 300,
  showGrid = true,
  showTooltip = true,
  animate = true
}: AdvancedChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    return data.map((point, index) => ({
      ...point,
      x: (index / (data.length - 1)) * 100,
      y: ((maxValue - point.value) / range) * 80 + 10, // 10% padding
      normalizedValue: ((point.value - minValue) / range) * 100
    }));
  }, [data]);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-800 mb-4">{title}</h4>
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-sm">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const avgValue = Math.round(data.reduce((sum, d) => sum + d.value, 0) / data.length);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium text-gray-800">{title}</h4>
        <div className="flex gap-4 text-xs text-gray-600">
          <span>Max: {maxValue}</span>
          <span>Avg: {avgValue}</span>
          <span>Min: {minValue}</span>
        </div>
      </div>
      
      <div className="relative" style={{ height: `${height}px` }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0"
        >
          {/* Grid lines */}
          {showGrid && (
            <defs>
              <pattern id={`grid-${title}`} width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f3f4f6" strokeWidth="0.3"/>
              </pattern>
            </defs>
          )}
          {showGrid && <rect width="100" height="100" fill={`url(#grid-${title})`} />}
          
          {/* Y-axis reference lines */}
          <line x1="0" y1="25" x2="100" y2="25" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.5"/>
          <line x1="0" y1="50" x2="100" y2="50" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.5"/>
          <line x1="0" y1="75" x2="100" y2="75" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.5"/>
          
          {type === "area" && (
            <>
              {/* Area fill */}
              <path
                d={`M 0 100 ${chartData.map(point => `L ${point.x} ${point.y}`).join(' ')} L 100 100 Z`}
                fill={color.replace('bg-', '').replace('-500', '')}
                fillOpacity="0.2"
                className={animate ? "transition-all duration-1000" : ""}
              />
              
              {/* Line */}
              <path
                d={`M ${chartData[0].x} ${chartData[0].y} ${chartData.slice(1).map(point => `L ${point.x} ${point.y}`).join(' ')}`}
                fill="none"
                stroke={color.replace('bg-', '').replace('-500', '')}
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                className={animate ? "transition-all duration-1000" : ""}
              />
            </>
          )}
          
          {type === "line" && (
            <>
              {/* Line */}
              <path
                d={`M ${chartData[0].x} ${chartData[0].y} ${chartData.slice(1).map(point => `L ${point.x} ${point.y}`).join(' ')}`}
                fill="none"
                stroke={color.replace('bg-', '').replace('-500', '')}
                strokeWidth="2.5"
                vectorEffect="non-scaling-stroke"
                className={animate ? "transition-all duration-1000" : ""}
              />
              
              {/* Data points */}
              {chartData.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r="2"
                  fill={color.replace('bg-', '').replace('-500', '')}
                  vectorEffect="non-scaling-stroke"
                  className={`${animate ? "transition-all duration-1000" : ""} hover:r-3 cursor-pointer`}
                />
              ))}
            </>
          )}
          
          {type === "bar" && (
            chartData.map((point, index) => (
              <rect
                key={index}
                x={point.x - 1.5}
                y={point.y}
                width="3"
                height={100 - point.y}
                fill={color.replace('bg-', '').replace('-500', '')}
                fillOpacity="0.8"
                className={`${animate ? "transition-all duration-1000" : ""} hover:fill-opacity-100 cursor-pointer`}
              />
            ))
          )}
        </svg>
        
        {/* Tooltips */}
        {showTooltip && (
          <div className="absolute inset-0 pointer-events-none">
            {chartData.map((point, index) => (
              <div
                key={index}
                className="absolute transform -translate-x-1/2 group"
                style={{
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                }}
              >
                <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity -translate-y-8 pointer-events-auto">
                  <div className="font-medium">{point.date}</div>
                  <div>{point.value}{point.label && ` ${point.label}`}</div>
                  {point.category && <div className="text-gray-300">{point.category}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-4 text-xs text-gray-600">
        <span>{chartData[0]?.date}</span>
        <span className="text-center font-medium">
          Trend: {data[data.length - 1]?.value > data[0]?.value ? "📈 Improving" : 
                  data[data.length - 1]?.value < data[0]?.value ? "📉 Declining" : "➡️ Stable"}
        </span>
        <span>{chartData[chartData.length - 1]?.date}</span>
      </div>
    </div>
  );
}
