import { HttpError } from "./errors";

type AsyncHandler = (...args: any[]) => Promise<any>;

export function withErrorHandler(handler: AsyncHandler): AsyncHandler {
  return async (...args) => {
    try {
      // Pass everything to the original handler
      console.log("AM I HERE?");
      return await handler(...args);
    } catch (err) {
      console.log(err);
      // Turn into a proper HTTP response
      if (err instanceof HttpError) {
        // For App Router we just return a Response
        return new Response(JSON.stringify({ error: err.message }), {
          status: err.status,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Anything else return default 400 error.
      console.error("Unexpected error in route handler:", err);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  };
}
