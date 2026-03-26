"use client"

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"

const data = [
  {
    name: "A",
    value: 400,
  },
  {
    name: "B",
    value: 300,
  },
  {
    name: "C",
    value: 300,
  },
  {
    name: "D",
    value: 200,
  },
]

export default function Chart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}
