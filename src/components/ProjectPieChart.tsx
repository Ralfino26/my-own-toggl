'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useRouter } from 'next/navigation';

interface ChartData {
  name: string;
  value: number;
  projectId: string;
  color: string;
  glow: string;
  percentage: string;
  [key: string]: any; // Allow index signature for Recharts compatibility
}

interface ProjectPieChartProps {
  data: ChartData[];
}

export default function ProjectPieChart({ data }: ProjectPieChartProps) {
  const router = useRouter();

  // Custom label function to show percentage
  const renderCustomLabel = ({ percent, name }: any) => {
    if (percent < 0.08) return null; // Don't show label for very small slices
    return `${(percent * 100).toFixed(0)}%`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const displayValue = data.payload?.displayValue ?? data.value;
      const totalHours = data.payload?.totalHours || data.value;
      const percentage = data.payload?.percentage || ((displayValue / totalHours) * 100).toFixed(1);
      return (
        <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-2xl">
          <p className="text-white font-semibold mb-1">{data.name}</p>
          <p className="text-white/90 text-sm">
            <span className="font-bold text-lg">{displayValue.toFixed(2)}</span> uur
          </p>
          <p className="text-white/70 text-xs mt-1">
            {percentage}% van totaal
          </p>
          <p className="text-white/60 text-xs mt-2 pt-2 border-t border-white/10">
            Klik om project te openen
          </p>
        </div>
      );
    }
    return null;
  };

  const handlePieClick = (entry: any) => {
    // Recharts onClick passes the data entry directly
    const projectId = entry?.projectId;
    if (projectId) {
      router.push(`/project/${projectId}`);
    }
  };

  return (
    <div className="w-full max-w-[350px] h-[350px] mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={110}
            innerRadius={40}
            fill="#8884d8"
            dataKey="value"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth={3}
            paddingAngle={2}
            animationBegin={0}
            animationDuration={800}
            animationEasing="ease-out"
            onClick={handlePieClick}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                style={{
                  filter: `drop-shadow(0 0 8px ${entry.glow})`,
                  transition: 'opacity 0.3s, transform 0.2s',
                }}
                className="hover:opacity-80 cursor-pointer active:scale-95"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

