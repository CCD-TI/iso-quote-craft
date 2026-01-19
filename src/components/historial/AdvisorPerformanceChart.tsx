import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Advisor, Quotation } from '@/types/quotation';
import { ChartContainer, ChartLegend, ChartLegendContent, type ChartConfig, ChartTooltip } from '@/components/ui/chart';

type AdvisorPerformanceChartProps = {
  advisors: Advisor[];
  quotations: Quotation[];
  advisorFilter: string;
};

type ChartRow = {
  advisorId: string;
  advisorName: string;
  quoted: number; // S/.
  sold: number; // S/. (solo aprobadas)
};

const chartConfig = {
  quoted: {
    label: 'Total Cotizado',
    color: 'hsl(var(--primary))',
  },
  sold: {
    label: 'Total Vendido (Aprobadas)',
    color: 'hsl(var(--success))',
  },
} satisfies ChartConfig;

const formatCurrency = (amount: number) =>
  `S/. ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatCompactCurrency = (amount: number) => {
  const compact = new Intl.NumberFormat('es-PE', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
  return `S/. ${compact}`;
};

function AdvisorPerformanceTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; dataKey?: string; value?: unknown }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="grid gap-2 rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
      <div className="font-medium text-foreground">{label}</div>
      <div className="grid gap-1">
        {payload.map((item) => {
          const key = String(item.dataKey || item.name || '');
          const cfg = (chartConfig as Record<string, { label: string }>)[key];
          const value = Number(item.value ?? 0);

          return (
            <div key={key} className="flex items-center justify-between gap-6">
              <span className="text-muted-foreground">{cfg?.label ?? key}</span>
              <span className="font-mono font-medium tabular-nums text-foreground">{formatCurrency(value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdvisorPerformanceChart({
  advisors,
  quotations,
  advisorFilter,
}: AdvisorPerformanceChartProps) {
  const data = useMemo<ChartRow[]>(() => {
    const scopedQuotations =
      advisorFilter === 'all'
        ? quotations
        : quotations.filter((q) => q.client.asesorId === advisorFilter);

    const advisorsToRender =
      advisorFilter === 'all'
        ? advisors
        : advisors.filter((a) => a.id === advisorFilter);

    const rowsByAdvisor = new Map<string, ChartRow>();

    // Pre-cargar asesores (para que salgan aunque tengan 0)
    for (const a of advisorsToRender) {
      rowsByAdvisor.set(a.id, {
        advisorId: a.id,
        advisorName: a.name,
        quoted: 0,
        sold: 0,
      });
    }

    const UNASSIGNED = '__unassigned__';

    for (const q of scopedQuotations) {
      const rawId = q.client.asesorId;
      const advisorId = rawId ? rawId : UNASSIGNED;
      const advisorName = rawId
        ? advisors.find((a) => a.id === rawId)?.name || 'Sin asignar'
        : 'Sin asignar';

      const current = rowsByAdvisor.get(advisorId) ?? {
        advisorId,
        advisorName,
        quoted: 0,
        sold: 0,
      };

      current.quoted += q.total || 0;
      if (q.status === 'approved') current.sold += q.total || 0;

      rowsByAdvisor.set(advisorId, current);
    }

    return Array.from(rowsByAdvisor.values()).sort((a, b) => b.sold - a.sold);
  }, [advisors, quotations, advisorFilter]);

  if (!data.length) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        No hay datos suficientes para mostrar el gráfico.
      </div>
    );
  }

  return (
    <ChartContainer id="advisor-performance" config={chartConfig} className="h-[340px] w-full">
      <BarChart data={data} margin={{ top: 10, right: 16, left: 12, bottom: 36 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="advisorName"
          interval={0}
          angle={-20}
          textAnchor="end"
          height={60}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => formatCompactCurrency(Number(v))}
          width={90}
        />
        <ChartTooltip content={<AdvisorPerformanceTooltip />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="quoted" fill="var(--color-quoted)" radius={[6, 6, 0, 0]} />
        <Bar dataKey="sold" fill="var(--color-sold)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
