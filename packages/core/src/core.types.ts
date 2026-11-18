/** Minimal shape of an HTTP request carrying an authenticated user. */
export interface AuthenticatedRequest<TUser = unknown> {
  headers: Record<string, string | string[] | undefined>;
  user?: TUser;
}

/** A user that may carry roles, as read by `RolesGuard`. */
export interface UserWithRoles {
  roles?: string[];
}
