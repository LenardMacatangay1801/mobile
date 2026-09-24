import { createContext, useContext, useMemo, useState, ReactNode } from 'react'

export type RouteStatus = 'unread' | 'read' | 'blocked'

export type BlockReason =
  | 'gate_locked'
  | 'no_one_home'
  | 'stuck_defective'
  | 'qr_damaged'

export type Consumer = {
  acct: string
  name: string
  meter: string
  block: string
  lot: string
  address: string
  prevReading: number
}

export type RouteEntry = Consumer & {
  status: RouteStatus
  presentReading: number | null
  consumption: number | null
  notes: string
  blockReason: BlockReason | null
  savedAt: string | null
  syncState: 'local' | 'sent'
}

export const BLOCK_REASONS: { id: BlockReason; label: string; tagalog: string }[] = [
  { id: 'gate_locked', label: 'Gate locked', tagalog: 'Nakasarado' },
  { id: 'no_one_home', label: 'No one home', tagalog: 'Walang tao' },
  { id: 'stuck_defective', label: 'Stuck or defective', tagalog: 'Sira ang metro' },
  { id: 'qr_damaged', label: 'QR damaged', tagalog: 'Sira ang QR' },
]

const INITIAL_ROUTE: RouteEntry[] = [
  {
    acct: 'ACC-00142',
    name: 'Maria Santos',
    meter: 'MTR-7821',
    block: '4',
    lot: '12',
    address: 'Blk 4 Lot 12, Banaba West, Batangas City',
    prevReading: 1240,
    status: 'unread',
    presentReading: null,
    consumption: null,
    notes: '',
    blockReason: null,
    savedAt: null,
    syncState: 'local',
  },
  {
    acct: 'ACC-00087',
    name: 'Jose Reyes',
    meter: 'MTR-4453',
    block: '2',
    lot: '6',
    address: 'Blk 2 Lot 6, Banaba West, Batangas City',
    prevReading: 880,
    status: 'unread',
    presentReading: null,
    consumption: null,
    notes: '',
    blockReason: null,
    savedAt: null,
    syncState: 'local',
  },
  {
    acct: 'ACC-00231',
    name: 'Ana Dela Cruz',
    meter: 'MTR-9102',
    block: '7',
    lot: '3',
    address: 'Blk 7 Lot 3, Banaba West, Batangas City',
    prevReading: 2100,
    status: 'unread',
    presentReading: null,
    consumption: null,
    notes: '',
    blockReason: null,
    savedAt: null,
    syncState: 'local',
  },
  {
    acct: 'ACC-00055',
    name: 'Roberto Villanueva',
    meter: 'MTR-3341',
    block: '1',
    lot: '9',
    address: 'Blk 1 Lot 9, Banaba West, Batangas City',
    prevReading: 660,
    status: 'unread',
    presentReading: null,
    consumption: null,
    notes: '',
    blockReason: null,
    savedAt: null,
    syncState: 'local',
  },
  {
    acct: 'ACC-00198',
    name: 'Lourdes Bautista',
    meter: 'MTR-6678',
    block: '5',
    lot: '1',
    address: 'Blk 5 Lot 1, Banaba West, Batangas City',
    prevReading: 1530,
    status: 'unread',
    presentReading: null,
    consumption: null,
    notes: '',
    blockReason: null,
    savedAt: null,
    syncState: 'local',
  },
]

type RouteContextType = {
  route: RouteEntry[]
  getConsumer: (acct: string) => RouteEntry | undefined
  saveReading: (acct: string, presentReading: number, notes?: string) => void
  saveBlocked: (acct: string, reason: BlockReason, notes?: string) => void
  resetDemoRoute: () => void
  counts: { total: number; read: number; blocked: number; unread: number }
}

const RouteContext = createContext<RouteContextType | null>(null)

function cloneInitial() {
  return INITIAL_ROUTE.map((row) => ({ ...row }))
}

export function RouteProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<RouteEntry[]>(cloneInitial)

  const counts = useMemo(() => {
    const read = route.filter((r) => r.status === 'read').length
    const blocked = route.filter((r) => r.status === 'blocked').length
    const unread = route.filter((r) => r.status === 'unread').length
    return { total: route.length, read, blocked, unread }
  }, [route])

  function getConsumer(acct: string) {
    return route.find((r) => r.acct === acct)
  }

  function saveReading(acct: string, presentReading: number, notes = '') {
    setRoute((prev) =>
      prev.map((row) => {
        if (row.acct !== acct) return row
        return {
          ...row,
          status: 'read',
          presentReading,
          consumption: presentReading - row.prevReading,
          notes,
          blockReason: null,
          savedAt: new Date().toISOString(),
          syncState: 'local',
        }
      }),
    )
  }

  function saveBlocked(acct: string, reason: BlockReason, notes = '') {
    setRoute((prev) =>
      prev.map((row) => {
        if (row.acct !== acct) return row
        return {
          ...row,
          status: 'blocked',
          presentReading: null,
          consumption: null,
          notes,
          blockReason: reason,
          savedAt: new Date().toISOString(),
          syncState: 'local',
        }
      }),
    )
  }

  function resetDemoRoute() {
    setRoute(cloneInitial())
  }

  return (
    <RouteContext.Provider
      value={{ route, getConsumer, saveReading, saveBlocked, resetDemoRoute, counts }}
    >
      {children}
    </RouteContext.Provider>
  )
}

export function useRoute() {
  const context = useContext(RouteContext)
  if (!context) throw new Error('useRoute() must be used inside <RouteProvider>')
  return context
}

export function statusLabel(status: RouteStatus) {
  if (status === 'read') return 'Read'
  if (status === 'blocked') return 'Blocked'
  return 'Unread'
}

export function blockReasonLabel(reason: BlockReason | null) {
  if (!reason) return ''
  return BLOCK_REASONS.find((r) => r.id === reason)?.label ?? reason
}
