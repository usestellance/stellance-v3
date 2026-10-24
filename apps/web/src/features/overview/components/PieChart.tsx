"use client";

import * as React from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";

import { useGetInvoiceOverview } from "@/features/overview/hooks";
import { months } from "@/lib/constants";

/* ---------------------------------- */
/* Status → color mapping (scales well) */
/* ---------------------------------- */
const STATUS_COLORS: Record<string, string> = {
  draft: "var(--color-info-300)",
  sent: "var(--color-info-600)",
  paid: "var(--color-success-500)",
  overdue: "var(--color-orange-500)",
  cancelled: "var(--color-error-500)",
  viewed: "var(--color-warning-500)",
};

const getStatusColor = (status: string) =>
  STATUS_COLORS[status.toLowerCase()] ?? "var(--color-primary-300)";

/* ---------------------------------- */
/* Month options */
/* ---------------------------------- */
const MONTHS = [
  { value: "january", label: "January" },
  { value: "february", label: "February" },
  { value: "march", label: "March" },
  { value: "april", label: "April" },
  { value: "may", label: "May" },
  { value: "june", label: "June" },
  { value: "july", label: "July" },
  { value: "august", label: "August" },
  { value: "september", label: "September" },
  { value: "october", label: "October" },
  { value: "november", label: "November" },
  { value: "december", label: "December" },
];

type StatusItem = {
  status: string;
  value: number;
};

/* ---------------------------------- */

export function ChartPieInteractive() {
  const id = "pie-interactive";
  const currentMonthIndex = new Date().getMonth();
  const currentMonth = months[currentMonthIndex];
  const [activeMonth, setActiveMonth] = React.useState<string>(currentMonth);
  const [selectedStatus, setActiveStatus] = React.useState<string>();

  const { data, isPending } = useGetInvoiceOverview(activeMonth);

  // console.log(data);

  const sumValues = (data: StatusItem[]): number => {
    return data?.reduce((total, item) => total + item.value, 0);
  };

  const total = sumValues(data);
  /* ---------------------------------- */
  /* Transform backend data → chart data */
  /* ---------------------------------- */
  const chartData = React.useMemo(() => {
    if (!data) return [];

    return data.map((item: { status: string; value: number }) => ({
      status: item.status.toLowerCase(),
      label: item.status,
      value: item.value,
      fill: getStatusColor(item.status),
    }));
  }, [data]);

  /* ---------------------------------- */
  /* Chart config generated dynamically */
  /* ---------------------------------- */
  const chartConfig = React.useMemo<ChartConfig>(() => {
    const config: ChartConfig = {
      value: { label: "Invoices" },
    };

    chartData.forEach(
      (item: { status: string | number; label: string; fill: string }) => {
        config[item.status] = {
          label: item.label,
          color: item.fill,
        };
      },
    );

    return config;
  }, [chartData]);

  /* ---------------------------------- */
  /* Active slice: the one picked, else the first */
  /* ---------------------------------- */
  const activeStatus: string | undefined = selectedStatus ?? chartData[0]?.status;

  const activeIndex = React.useMemo(() => {
    return (
      chartData.findIndex(
        (i: { status: string | undefined }) => i.status === activeStatus,
      ) || 0
    );
  }, [chartData, activeStatus]);

  return (
    <Card data-chart={id} className="flex flex-col pt-6 pb-7">
      <ChartStyle id={id} config={chartConfig} />

      <CardHeader className="flex items-center space-y-0 pb-4">
        <div className="grid gap-1">
          <CardTitle>Invoice Status</CardTitle>
        </div>

        <Select value={activeMonth} onValueChange={setActiveMonth}>
          <SelectTrigger
            className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
            aria-label="Select month"
          >
            <SelectValue placeholder="Select month" />
          </SelectTrigger>

          <SelectContent align="end" className="rounded-xl">
            {MONTHS.map((month) => (
              <SelectItem
                key={month.value}
                value={month.value}
                className="rounded-lg"
              >
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="flex flex-1 justify-center pb-0">
        {isPending ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : !chartData.length ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center">
              <p className="text-muted-foreground">No invoice data</p>
              <p className="text-sm text-muted-foreground mt-1">
                for {MONTHS.find((m) => m.value === activeMonth)?.label}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col w-full h-full items-center justify-center">
            <ChartContainer
              id={id}
              config={chartConfig}
              className="mx-auto aspect-square w-full max-w-[300px] bgred-300"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />

                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="status"
                  innerRadius={60}
                  strokeWidth={5}
                  activeIndex={activeIndex}
                  activeShape={({
                    outerRadius = 0,
                    ...props
                  }: PieSectorDataItem) => (
                    <g>
                      <Sector {...props} outerRadius={outerRadius + 10} />
                      <Sector
                        {...props}
                        outerRadius={outerRadius + 25}
                        innerRadius={outerRadius + 12}
                      />
                    </g>
                  )}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {/* {chartData[activeIndex]?.value ?? total ?? 0} */}
                              {total ?? 0}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Invoice{total > 1 ? "s" : ""}
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            <PieLegend
              data={chartData}
              activeStatus={activeStatus}
              onSelect={setActiveStatus}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PieLegend({
  data,
  activeStatus,
  onSelect,
}: {
  data: {
    status: string;
    label: string;
    value: number;
    fill: string;
  }[];
  activeStatus?: string;
  onSelect: (status: string) => void;
}) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
      {data.map((item) => {
        const isActive = item.status === activeStatus;

        return (
          <button
            key={item.status}
            onClick={() => onSelect(item.status)}
            className={`flex items-center gap-2 text-left text-sm transition-opacity ${
              isActive ? "opacity-100" : "opacity-60 hover:opacity-100"
            }`}
          >
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.fill }}
            />
            <span className="capitalize">
              {item.label === "Viewed" ? "Pending" : item.label}
            </span>
            <span className="font-medium">{item.value}</span>
          </button>
        );
      })}
    </div>
  );
}
