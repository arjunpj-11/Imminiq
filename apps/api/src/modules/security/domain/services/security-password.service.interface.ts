export interface SecurityPasswordGateway {
  changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void>
}
