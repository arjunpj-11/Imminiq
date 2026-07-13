export type AdminBroadcastInput = { title: string; message: string; audience: 'all' | 'active'; deepLink?: string }
export type AdminBroadcast = { id: string; title: string; message: string; audience: string; sender: string; recipientCount: number; status: string; sentAt: Date }
export type AdminBroadcastResult = { id: string; recipientCount: number; status: string }
