import * as React from "react";

export interface BarChartSeries {
  name: string;
  values: Array<number | null>;
  barClassName: string;
}

export interface BarChartProps {
  labels: string[];
  series: BarChartSeries[];
  valueFormatter: (value: number) => string;
  ariaLabel: string;
}

const BarChart: React.FunctionComponent<BarChartProps> = props => {
  const { labels, series, valueFormatter, ariaLabel } = props;

  const maxValue = Math.max(
    0,
    ...series.flatMap(seriesItem => seriesItem.values.map(value => (value === null ? 0 : value)))
  );

  return (
    <div role="img" aria-label={ariaLabel} className="w-full">
      <div className="flex h-[210px] items-end gap-2 border-b border-tableBorder">
        {labels.map((label, labelIndex) => (
          <div key={`${label}-${labelIndex}`} className="flex h-full flex-1 items-end justify-center gap-1">
            {series.map(seriesItem => {
              const value = seriesItem.values[labelIndex];

              if (value === null) {
                return <div key={seriesItem.name} className="flex h-full flex-1 items-end justify-center" />;
              }

              const heightPercent =
                maxValue > 0 ? Math.max((Math.max(0, value) / maxValue) * 100, value > 0 ? 1.5 : 0) : 0;

              return (
                <div
                  key={seriesItem.name}
                  className="flex h-full flex-1 items-end justify-center"
                  title={`${seriesItem.name} · ${label}: ${valueFormatter(value)}`}
                >
                  <div
                    aria-hidden="true"
                    className={`w-full max-w-[38px] rounded-t-sm transition-[height] duration-500 ease-out ${seriesItem.barClassName}`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-2">
        {labels.map((label, labelIndex) => (
          <span
            key={`${label}-axis-${labelIndex}`}
            className="flex-1 text-center text-[11px] leading-tight text-gray-500"
          >
            {label}
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {series.map(seriesItem => (
          <span key={`${seriesItem.name}-legend`} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-sm ${seriesItem.barClassName}`} />
            {seriesItem.name}
          </span>
        ))}
      </div>
    </div>
  );
};

export { BarChart };
