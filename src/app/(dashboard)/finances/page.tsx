'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import { TrendingUp, TrendingDown, DollarSign, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Property, Tenant, RentPayment, Expense } from '@/types'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const EXPENSE_CATEGORIES = [
  { value: 'repairs', label: 'Repairs' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'agent_fees', label: 'Agent fees' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'other', label: 'Other' },
]

export default function FinancesPage() {
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth())
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [properties, setProperties] = useState<Property[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [payments, setPayments] = useState<RentPayment[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [newExpense, setNewExpense] = useState({
    category: 'repairs',
    amount: '',
    description: '',
    property_id: '',
    date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchData()
  }, [selectedMonth, selectedYear])

  const fetchData = async () => {
    setLoading(true)
    const supabase = createClient()

    const [{ data: props }, { data: tens }, { data: pays }, { data: exps }] = await Promise.all([
      supabase.from('properties').select('*'),
      supabase.from('tenants').select('*').eq('status', 'active'),
      supabase
        .from('rent_payments')
        .select('*')
        .eq('period_month', selectedMonth + 1)
        .eq('period_year', selectedYear),
      supabase
        .from('expenses')
        .select('*')
        .gte('date', `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`)
        .lte('date', `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-31`),
    ])

    setProperties(props || [])
    setTenants(tens || [])
    setPayments(pays || [])
    setExpenses(exps || [])
    setLoading(false)
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    const { data: orgMember } = await supabase
      .from('organisation_members')
      .select('organisation_id')
      .single()

    await supabase.from('expenses').insert({
      organisation_id: orgMember?.organisation_id,
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
      property_id: newExpense.property_id || null,
      date: newExpense.date,
    })

    setNewExpense({ category: 'repairs', amount: '', description: '', property_id: '', date: new Date().toISOString().split('T')[0] })
    setShowExpenseForm(false)
    fetchData()
  }

  const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const netProfit = totalIncome - totalExpenses

  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11)
      setSelectedYear((y) => y - 1)
    } else {
      setSelectedMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSelectedYear((y) => y + 1)
    } else {
      setSelectedMonth((m) => m + 1)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header + month selector */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Finances</h1>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ChevronLeft className="h-4 w-4 text-slate-500" />
          </button>
          <span className="text-sm font-semibold text-slate-900 dark:text-white w-36 text-center">
            {MONTHS[selectedMonth]} {selectedYear}
          </span>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ChevronRight className="h-4 w-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">Total income</span>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalIncome)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">Total expenses</span>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(totalExpenses)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">Net profit</span>
              <DollarSign className={`h-4 w-4 ${netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
            </div>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(netProfit)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Income table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rent income</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {tenants.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No active tenants</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Rent due</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => {
                  const property = properties.find((p) => p.id === tenant.property_id)
                  const payment = payments.find((p) => p.tenant_id === tenant.id)
                  return (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">
                        {tenant.first_name} {tenant.last_name}
                      </TableCell>
                      <TableCell className="text-slate-500">{property?.title || '—'}</TableCell>
                      <TableCell>{formatCurrency(tenant.rent_amount)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${payment ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {payment ? `Paid ${formatDateShort(payment.paid_at)}` : 'Unpaid'}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Expenses */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Expenses</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setShowExpenseForm(!showExpenseForm)} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add expense
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {showExpenseForm && (
            <form onSubmit={handleAddExpense} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Category</Label>
                  <Select value={newExpense.category} onValueChange={(v) => setNewExpense({ ...newExpense, category: v })}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Amount (£)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    required
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-xs">Description</Label>
                  <Input
                    placeholder="Brief description"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    required
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Property (optional)</Label>
                  <Select value={newExpense.property_id} onValueChange={(v) => setNewExpense({ ...newExpense, property_id: v })}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="All properties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All properties</SelectItem>
                      {properties.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Date</Label>
                  <Input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowExpenseForm(false)}>Cancel</Button>
                <Button type="submit" size="sm">Add expense</Button>
              </div>
            </form>
          )}

          {expenses.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No expenses logged this month</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => {
                  const property = properties.find((p) => p.id === expense.property_id)
                  return (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell className="text-slate-500 capitalize">{expense.category.replace('_', ' ')}</TableCell>
                      <TableCell className="text-slate-500">{property?.title || 'All properties'}</TableCell>
                      <TableCell className="text-slate-500">{formatDateShort(expense.date)}</TableCell>
                      <TableCell className="text-right text-red-600 dark:text-red-400 font-medium">
                        {formatCurrency(expense.amount)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
