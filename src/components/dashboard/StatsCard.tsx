import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

export interface StatsCardProps {
  title: string;
  value: string | number;
  delta?: string;
  children?: React.ReactNode;
}

export default function StatsCard({ title, value, delta, children }: StatsCardProps) {
  return (
    <Card className="rounded-lg border p-4">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-sm">{title}</CardTitle>
          </div>
          <div>{children}</div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mt-2 flex items-baseline gap-2">
          <div className="text-2xl font-semibold">{value}</div>
          {delta && <div className="text-sm text-muted-foreground">{delta}</div>}
        </div>
      </CardContent>

      <CardFooter />
    </Card>
  );
}

