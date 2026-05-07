export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(resourceName: string, id: string) {
    super(404, "NOT_FOUND", `${resourceName} not found`, { id });
  }
}
