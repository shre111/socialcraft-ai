'use client'

import { Loader2, BarChart3, Heart, Copy, PenLine, Send, Zap } from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useAnalytics } from '@/hooks/useAnalytics'

const COLORS = ['#7c3aed', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#f5f3ff', '#6d28d9']

export default function AnalyticsPage() {
  const { data, isLoading, error } = useAnalytics()

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading analytics…
      </div>
    )

  if (error || !data)
    return (
      <div className="py-20 text-center text-gray-400">
        Could not load analytics. Generate some captions first!
      </div>
    )

  const { totals, captionsPerDay, topPlatforms, topTones, topLanguages, engagementByPlatform } = data

  const statCards = [
    { label: 'Total Captions', value: totals.captions, icon: BarChart3, color: 'text-violet-600 bg-violet-50' },
    { label: 'Liked', value: totals.liked, icon: Heart, color: 'text-pink-600 bg-pink-50' },
    { label: 'Copied / Used', value: totals.used, icon: Copy, color: 'text-blue-600 bg-blue-50' },
    { label: 'Edited', value: totals.edited, icon: PenLine, color: 'text-amber-600 bg-amber-50' },
    { label: 'Published', value: totals.published, icon: Send, color: 'text-green-600 bg-green-50' },
    { label: 'Total Events', value: totals.events, icon: Zap, color: 'text-gray-600 bg-gray-100' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Your caption performance at a glance.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Captions per day */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Captions generated — last 14 days</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={captionsPerDay}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={1} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top platforms */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Top platforms</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topPlatforms} layout="vertical">
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="platform" tick={{ fontSize: 11 }} width={70} />
              <Tooltip />
              <Bar dataKey="count" fill="#7c3aed" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top tones */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Top tones</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={topTones}
                dataKey="count"
                nameKey="tone"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ tone, percent }) => `${tone} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {topTones.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top languages */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Languages used</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topLanguages}>
              <XAxis dataKey="language" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#a78bfa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement by platform */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Likes by platform</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={engagementByPlatform}>
              <XAxis dataKey="platform" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" name="Total" fill="#ddd6fe" radius={[4, 4, 0, 0]} />
              <Bar dataKey="liked" name="Liked" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
