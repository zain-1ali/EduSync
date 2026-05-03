import { use } from "react";
import { useNavigate } from "react-router-dom";

export function StatsCards() {
  const navigate=useNavigate();
  const stats = [
    { title: "Total Students", value: "450", trend: "+5%", icon: "person_celebrate", color: "text-primary", bg: "bg-primary/10", trendColor: "text-emerald-600", trendIcon: "trending_up", path: "/students" },
    { title: "Fees Collected (Month)", value: "$12,400", trend: "-2%", icon: "account_balance_wallet", color: "text-emerald-600", bg: "bg-emerald-500/10", trendColor: "text-rose-600", trendIcon: "trending_down", path: "/fees" },
    { title: "Pending Dues", value: "$3,200", trend: "+10%", icon: "pending_actions", color: "text-amber-500", bg: "bg-amber-500/10", trendColor: "text-emerald-600", trendIcon: "trending_up", path: "" },
    { title: "Total Defaulters", value: "12", trend: "-1%", icon: "warning", color: "text-rose-600", bg: "bg-rose-500/10", trendColor: "text-rose-600", trendIcon: "trending_down", path: "/defaulters" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4 cursor-pointer" onClick={()=>{stat.path && navigate(stat.path)}}>
          <div className="flex items-center justify-between">
            <span className={`material-symbols-outlined ${stat.color} ${stat.bg} p-2 rounded-lg`}>{stat.icon}</span>
            <span className={`${stat.trendColor} text-sm font-medium flex items-center gap-1`}>
              {stat.trend} <span className="material-symbols-outlined text-xs">{stat.trendIcon}</span>
            </span>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.title}</p>
            <p className="text-3xl font-bold mt-1">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}