import { z } from "zod";

// SAP B1 Service Layer Login Request
export const sapLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  environment: z.enum(["HANA", "MSSQL"], {
    required_error: "Please select a database environment"
  })
});

export type SapLoginRequest = z.infer<typeof sapLoginSchema>;

// SAP B1 Session Data
export const sapSessionSchema = z.object({
  sessionId: z.string(),
  username: z.string(),
  environment: z.string(),
  version: z.string(),
  timeout: z.number(),
  expiresAt: z.date()
});

export type SapSession = z.infer<typeof sapSessionSchema>;

// Business Partner from SAP B1
export const businessPartnerSchema = z.object({
  CardCode: z.string(),
  CardName: z.string(),
  CardType: z.string(),
  Valid: z.string(),
  CurrentAccountBalance: z.number().optional(),
  Currency: z.string().optional()
});

export type BusinessPartner = z.infer<typeof businessPartnerSchema>;

// Dashboard Stats
export const dashboardStatsSchema = z.object({
  totalPartners: z.number(),
  activeItems: z.number(),
  openOrders: z.number(),
  sessionTimeRemaining: z.string()
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;

// API Response wrapper
export const apiResponseSchema = <T>(dataSchema: z.ZodType<T>) => z.object({
  success: z.boolean(),
  data: dataSchema.optional(),
  error: z.string().optional()
});

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
