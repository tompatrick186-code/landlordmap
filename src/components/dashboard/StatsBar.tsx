import React from 'react'
import { Building2, Users, AlertTriangle, Wrench, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Stat {
  label: string
  value: string | number
  icon: React.ElementType
  change?: string
  changePositive?: boolean
  iconColor: string
  iconBg: string
}

interface StatsBarProps {
  totalProperties: number
  occupancyPercent: number
  vacantCount: number
  openMaintenance: number
  monthlyRent: number
}

export function StatsBar({
  totalProperties,
  occupancyPercent,
  vacantCount,
  openMaintenance,
  monthlyRent,
}: StatsBarProps) {
  const stats: Stat[] = [
    {
      label: 'Total properties',
      value: totalProperties,
      icon: Building2,
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Occupancy rate',
      value: `${occupancyPercent}%`,
      icon: TrendingUp,
      change: 'vs last month',
      changePositive: true,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: 'Vacant units',
      value: vacantCount,
      icon: Users,
      iconColor: vacantCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400',
      iconBg: vacantCount > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-slate-100 dark:bg-slate-800',
    },
    {
      label: 'Open maintenance',
      value: openMaintenance,
      icon: Wrench,
      iconColor: openMaintenance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400',
      iconBg: openMaintenance > 0 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-slate-100 dark:bg-slate-800',
    },
    {
      label: 'Monthly rent roll',
      value: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(monthlyRent),
      icon: AlertTriangle,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {stat.label}
              </span>
              <div className={cn('p-1.5 rounded-lg', stat.iconBg)}>
                <Icon className={cn('h-3.5 w-3.5', stat.iconColor)} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
            {stat.change && (
              <div
                className={cn(
                  'text-xs mt-1',
                  stat.changePositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                )}
              >
                {stat.change}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
