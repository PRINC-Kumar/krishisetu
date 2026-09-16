import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { mandiApi } from "../../api/mandiApi.js";
import Card from "./Card.jsx";

export default function MandiChart() {
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    mandiApi
      .all()
      .then((res) => setPrices(Array.isArray(res.data) ? res.data : []))
      .catch(() => setPrices([]));
  }, []);

  // Aggregate by unique cropName, selecting the latest recorded date
  const chartData = Object.values(
    prices.reduce((acc, curr) => {
      if (
        !acc[curr.cropName] ||
        new Date(curr.date) > new Date(acc[curr.cropName].date)
      ) {
        acc[curr.cropName] = {
          ...curr,
          label: `${curr.cropName} (${curr.market})`,
        };
      }
      return acc;
    }, {}),
  );

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg text-leaf">
          Mandi Price Reference (Latest Modal Prices)
        </h3>
        <span className="text-xs text-soil/70">Source: APMC Mandis</span>
      </div>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="cropName" />
            <YAxis unit=" ₹" />
            <Tooltip
              formatter={(val, name, item) => [
                `Rs. ${val}/quintal (${item.payload.market})`,
                "Modal Price",
              ]}
            />
            <Bar
              dataKey="modalPrice"
              name="Price (Rs./quintal)"
              fill="#4A7C59"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
