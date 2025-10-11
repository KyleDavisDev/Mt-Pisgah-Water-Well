export class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    // Maintains proper stack trace (only needed in V8)
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends HttpError {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

export class ResourceNotFoundError extends HttpError {
  constructor(message = "Resource Not Found") {
    super(message, 404);
  }
}

export class MethodNotAllowedError extends HttpError {
  constructor(message = "Method Not Allowed") {
    super(message, 405);
  }
}

export class InternalServerError extends HttpError {
  constructor(message = "Server Error") {
    super(message, 500);
  }
}
