import { allowedOrigins } from "./allowedOrigins";

export const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      // Respond with a specific error for disallowed origins
      const error: any = new Error(
        `CORS policy does not allow this origin: ${origin}`
      );
      error.statusCode = 403; // Set a more appropriate status code
      callback(error);
    }
  },
  optionsSuccessStatus: 200,
};
