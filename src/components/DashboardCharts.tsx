import React from 'react';
import { Package, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

// Chart Components for Admin Dashboard
export function RevenueChart({ orders }: { orders: any[] }) {
  // Handle undefined or null orders
  if (!orders || !Array.isArray(orders)) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p className="text-sm">No data available</p>
        </div>
      </div>
    );
  }

  // Process last 6 months data
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      year: date.getFullYear(),
      fullDate: date
    };
  });

  const chartData = last6Months.map(({ month, fullDate }) => {
    const monthOrders = orders.filter(order => {
      if (!order.date) return false;
      const orderDate = new Date(order.date);
      return orderDate.getMonth() === fullDate.getMonth() && 
             orderDate.getFullYear() === fullDate.getFullYear();
    });

    const sales = monthOrders.reduce((sum, order) => sum + (order.subtotal || 0), 0);
    const profit = monthOrders.reduce((sum, order) => sum + (order.profit || 0), 0);

    return {
      month,
      sales: Math.round(sales / 1000), // Convert to thousands
      profit: Math.round(profit / 1000)
    };
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
        <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
          formatter={(value: any) => `₹${value}K`}
        />
        <Legend />
        <Line type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2} name="Sales" />
        <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Profit" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function OrderStatusChart({ orders }: { orders: any[] }) {
  // Handle undefined or null orders
  if (!orders || !Array.isArray(orders)) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p className="text-sm">No data available</p>
        </div>
      </div>
    );
  }

  const statusGroups = {
    'Pending': ['pending-approval', 'approved', 'placed'],
    'Processing': ['forwarded-to-vendor', 'vendor-processing', 'processing', 'confirmed'],
    'In Transit': ['vendor-dispatched', 'in-transit-to-warehouse', 'in-transit-to-buyer', 'dispatched'],
    'Completed': ['delivered', 'received-at-warehouse'],
    'Cancelled': ['cancelled']
  };

  const data = Object.entries(statusGroups).map(([label, statuses]) => ({
    name: label,
    value: orders.filter(o => statuses.includes(o.status)).length
  })).filter(item => item.value > 0);

  const COLORS = ['#f59e0b', '#6366f1', '#8b5cf6', '#10b981', '#ef4444'];

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p className="text-sm">No orders yet</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function CategorySalesChart({ orders }: { orders: any[] }) {
  // Handle undefined or null orders
  if (!orders || !Array.isArray(orders)) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p className="text-sm">No data available</p>
        </div>
      </div>
    );
  }

  // Aggregate sales by product type
  const categoryData: any = {};
  
  orders.forEach(order => {
    order.products?.forEach((product: any) => {
      const category = product.type || 'Other';
      if (!categoryData[category]) {
        categoryData[category] = 0;
      }
      categoryData[category] += (product.quantity || 1) * (product.sellingPrice || 0);
    });
  });

  const data = Object.entries(categoryData)
    .map(([name, value]) => ({
      name: name === 'readymade' ? 'Readymade' : name === 'fabric' ? 'Fabric' : name.charAt(0).toUpperCase() + name.slice(1),
      value: Math.round((value as number) / 1000) // Convert to thousands
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p className="text-sm">No sales data</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
        <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
          formatter={(value: any) => `₹${value}K`}
        />
        <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TopBuyersChart({ orders }: { orders: any[] }) {
  // Handle undefined or null orders
  if (!orders || !Array.isArray(orders)) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p className="text-sm">No data available</p>
        </div>
      </div>
    );
  }

  // Aggregate by buyer
  const buyerData: any = {};
  
  orders.forEach(order => {
    const buyer = order.buyer || 'Unknown';
    if (!buyerData[buyer]) {
      buyerData[buyer] = 0;
    }
    buyerData[buyer] += order.subtotal || 0;
  });

  const data = Object.entries(buyerData)
    .map(([name, value]) => ({
      name: name.length > 15 ? name.substring(0, 15) + '...' : name,
      value: Math.round((value as number) / 1000) // Convert to thousands
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p className="text-sm">No buyer data</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis type="number" stroke="#9ca3af" style={{ fontSize: '12px' }} />
        <YAxis dataKey="name" type="category" stroke="#9ca3af" style={{ fontSize: '11px' }} width={100} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
          formatter={(value: any) => `₹${value}K`}
        />
        <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}