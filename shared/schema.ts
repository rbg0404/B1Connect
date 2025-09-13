import { z } from "zod";

// SAP B1 Service Layer Login Request
export const sapLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  environment: z.enum(["HANA", "MSSQL"], {
    required_error: "Please select a database environment"
  }),
  database: z.string().min(1, "Please select a database")
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

// Item from SAP B1
export const itemSchema = z.object({
  ItemCode: z.string(),
  ItemName: z.string(),
  ItemType: z.string(),
  Valid: z.string(),
  QuantityOnStock: z.number().optional(),
  Price: z.number().optional(),
  Currency: z.string().optional(),
  ItemsGroupCode: z.number().optional(),
  BarCode: z.string().optional()
});

export type Item = z.infer<typeof itemSchema>;

// Sales Order from SAP B1
export const salesOrderSchema = z.object({
  DocEntry: z.number(),
  DocNum: z.number(),
  CardCode: z.string(),
  CardName: z.string(),
  DocDate: z.string(),
  DocDueDate: z.string().optional(),
  DocTotal: z.number(),
  Currency: z.string().optional(),
  DocumentStatus: z.string(),
  DocTotalSys: z.number().optional()
});

export type SalesOrder = z.infer<typeof salesOrderSchema>;

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

// Available Database
export const databaseSchema = z.object({
  name: z.string(),
  description: z.string(),
  environment: z.string()
});

export type Database = z.infer<typeof databaseSchema>;
