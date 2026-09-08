'use client'

type ExportCustomer = {
  email: string
  first_name: string | null
  last_name: string | null
  created_at: string
  emails_sent: number | null
  redeemed_at: string | null
  sequence_status: string
  offers: { title: string } | null
}

export function ExportCSVButton({
  customers,
  restaurantName,
}: {
  customers: ExportCustomer[]
  restaurantName: string
}) {
  function download() {
    const headers = ['Email', 'First Name', 'Last Name', 'Source Offer', 'Joined', 'Emails Sent', 'Redeemed At', 'Status']
    const rows = customers.map(c => [
      c.email,
      c.first_name ?? '',
      c.last_name ?? '',
      (c.offers as any)?.title ?? '',
      new Date(c.created_at).toLocaleDateString(),
      String(c.emails_sent ?? 0),
      c.redeemed_at ? new Date(c.redeemed_at).toLocaleDateString() : '',
      c.sequence_status,
    ])
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${restaurantName.replace(/\s+/g, '-').toLowerCase()}-customers-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button onClick={download} className="btn-ghost btn-sm">
      ↓ Export CSV
    </button>
  )
}
