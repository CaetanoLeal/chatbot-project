export function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value ?? 0)
}

export function formatPercent(value: number): string {
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value ?? 0)}%`
}

export function formatMinutes(minutes: number): string {
  if (!minutes) return "0min"
  if (minutes < 60) return `${Math.round(minutes)}min`
  const hours = Math.floor(minutes / 60)
  const rest = Math.round(minutes % 60)
  return rest > 0 ? `${hours}h ${rest}min` : `${hours}h`
}

export function formatBucketLabel(iso: string, period: "today" | "month" | "year"): string {
  const date = new Date(iso)
  if (period === "today") {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }
  if (period === "year") {
    return date.toLocaleDateString("pt-BR", { month: "short" })
  }
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}