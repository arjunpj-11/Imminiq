export const formatNotificationDate = (value: string) => new Date(value).toLocaleString()
export const isFailureNotification = (type: string) => type.endsWith('_failed')
