import { useMutation } from '@tanstack/react-query'
import api from '../../../../lib/axios'
import type { CreateSupportTicketInput, SupportTicketCreated } from '../types/support-tickets.types'
type ApiEnvelope<T> = { data: T }
export const useCreateSupportTicket = () => useMutation({ mutationFn: async (input: CreateSupportTicketInput) => (await api.post<ApiEnvelope<SupportTicketCreated>>('/support-tickets', input)).data.data })
