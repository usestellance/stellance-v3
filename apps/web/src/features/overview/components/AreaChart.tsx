"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/chart";
import { Input } from "@repo/ui/input";

import { useGetCashInflow } from "@/features/overview/hooks";
import { centsToDollars } from "@/lib/helpers";

/* ---------------------------------- */
/* Chart config                        */
/* ---------------------------------- */
const chartConfig = {
  amount: {
    label: "Cash Inflow",
    color: "var(--color-primary-500)",
  },
} satisfies ChartConfig;

/* ---------------------------------- */

export function ChartAreaInteractive() {
  const today = new Date().toISOString().split("T")[0];

  const [from, setFrom] = React.useState("2026-01-01");
  const [to, setTo] = React.useState(today);

  const { data } = useGetCashInflow({ from, to });

  // console.log("Cash Inflow Data:", data);

  /* ---------------------------------- */
  /* Normalize backend data             */
  /* Expected:
     [{ date: "2024-06-01", amount: 12000 }]
  /* ---------------------------------- */
  const chartData = React.useMemo(() => {
    if (!data) return [];

    return data.map((item: { date: string; amount: number }) => ({
      date: item.date,
      amount: centsToDollars(item.amount),
    }));
  }, [data]);

  // console.log(data);

  return (
    <Card className="pt-0">
      <CardHeader className="flex flex-col gap-4 border-b py-5">
        <div className="w-full">
          <CardTitle className="max-sm:text-xs text-center">
            Invoice Cash Flow
          </CardTitle>
        </div>
        {/* Date Filters */}
        <div className="flex flex-wrap items-center justify-between w-full gap-3">
          <div className="grid gap-1">
            <label className="text-xs text-muted-foreground">From</label>
            <Input
              type="date"
              value={from}
              max={to}
              onChange={(e) => setFrom(e.target.value)}
              className="h-9 w-[140px]"
            />
          </div>

          <div className="grid gap-1">
            <label className="text-xs text-muted-foreground">To</label>
            <Input
              type="date"
              value={to}
              min={from}
              max={today}
              onChange={(e) => setTo(e.target.value)}
              className="h-9 w-[140px]"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillAmount" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-amount)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-amount)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={true} />

            <XAxis
              dataKey="date"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) =>
                new Date(value).toLocaleString("en-US", {
                  month: "short",
                  year: "numeric",
                })
              }
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })
                  }
                />
              }
            />

            <Area
              dataKey="amount"
              type="monotone"
              fill="url(#fillAmount)"
              stroke="var(--color-amount)"
            />

            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
