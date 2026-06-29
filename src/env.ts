import { z } from "zod";

/**
 * Server-side environment variables, validated once at startup.
 * Importing this in client components would leak secrets, so keep it server-only.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
