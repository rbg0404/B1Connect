import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sapLoginSchema, type SapSession, type ApiResponse, type BusinessPartner, type DashboardStats } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // SAP B1 Service Layer configuration
  const SERVICE_LAYER_URL = process.env.SL_URL || "https://sap.itlobby.com:50000/b1s/v1";
  const DB_NAME = process.env.DB_NAME || "ZZZ_IT_TEST_LIVE_DB";
  const DB_USER = process.env.DB_USER || "manager";
  const DB_PASS = process.env.DB_PASS || "Ea@12345";

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      const loginData = sapLoginSchema.parse(req.body);
      
      const payload = {
        UserName: loginData.username,
        Password: loginData.password,
        CompanyDB: DB_NAME
      };

      const response = await fetch(`${SERVICE_LAYER_URL}/Login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(401).json({
          success: false,
          error: `Authentication failed: ${errorText}`
        } as ApiResponse<never>);
      }

      const sapResponse = await response.json();
      const sessionTimeout = sapResponse.SessionTimeout || 30;
      const expiresAt = new Date(Date.now() + sessionTimeout * 60 * 1000);

      const session: SapSession = {
        sessionId: sapResponse.SessionId,
        username: loginData.username,
        environment: loginData.environment,
        version: sapResponse.Version,
        timeout: sessionTimeout,
        expiresAt
      };

      await storage.storeSession(session);

      // Set session cookie
      res.cookie('sap_session', session.sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: sessionTimeout * 60 * 1000
      });

      res.json({
        success: true,
        data: {
          sessionId: session.sessionId,
          username: session.username,
          environment: session.environment,
          timeout: session.timeout
        }
      } as ApiResponse<Partial<SapSession>>);

    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({
        success: false,
        error: error instanceof z.ZodError ? error.errors[0].message : "Login failed"
      } as ApiResponse<never>);
    }
  });

  // Logout endpoint
  app.post("/api/logout", async (req, res) => {
    try {
      const sessionId = req.cookies.sap_session;
      if (sessionId) {
        await storage.removeSession(sessionId);
        res.clearCookie('sap_session');
      }
      
      res.json({
        success: true
      } as ApiResponse<never>);
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        success: false,
        error: "Logout failed"
      } as ApiResponse<never>);
    }
  });

  // Get current session
  app.get("/api/session", async (req, res) => {
    try {
      const sessionId = req.cookies.sap_session;
      if (!sessionId) {
        return res.status(401).json({
          success: false,
          error: "No active session"
        } as ApiResponse<never>);
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        res.clearCookie('sap_session');
        return res.status(401).json({
          success: false,
          error: "Session expired"
        } as ApiResponse<never>);
      }

      res.json({
        success: true,
        data: {
          sessionId: session.sessionId,
          username: session.username,
          environment: session.environment,
          timeout: session.timeout,
          timeRemaining: Math.ceil((session.expiresAt.getTime() - Date.now()) / 60000)
        }
      } as ApiResponse<any>);

    } catch (error) {
      console.error("Session check error:", error);
      res.status(500).json({
        success: false,
        error: "Session check failed"
      } as ApiResponse<never>);
    }
  });

  // Get business partners
  app.get("/api/business-partners", async (req, res) => {
    try {
      const sessionId = req.cookies.sap_session;
      if (!sessionId) {
        return res.status(401).json({
          success: false,
          error: "No active session"
        } as ApiResponse<never>);
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        res.clearCookie('sap_session');
        return res.status(401).json({
          success: false,
          error: "Session expired"
        } as ApiResponse<never>);
      }

      const response = await fetch(`${SERVICE_LAYER_URL}/BusinessPartners?$select=CardCode,CardName,CardType,Valid,CurrentAccountBalance,Currency&$top=50`, {
        headers: {
          "Cookie": `B1SESSION=${session.sessionId}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({
          success: false,
          error: `Failed to fetch business partners: ${errorText}`
        } as ApiResponse<never>);
      }

      const sapData = await response.json();
      
      res.json({
        success: true,
        data: sapData.value || []
      } as ApiResponse<BusinessPartner[]>);

    } catch (error) {
      console.error("Business partners fetch error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch business partners"
      } as ApiResponse<never>);
    }
  });

  // Get dashboard stats
  app.get("/api/dashboard-stats", async (req, res) => {
    try {
      const sessionId = req.cookies.sap_session;
      if (!sessionId) {
        return res.status(401).json({
          success: false,
          error: "No active session"
        } as ApiResponse<never>);
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        res.clearCookie('sap_session');
        return res.status(401).json({
          success: false,
          error: "Session expired"
        } as ApiResponse<never>);
      }

      // Fetch counts from different SAP B1 endpoints
      const [partnersResponse, itemsResponse, ordersResponse] = await Promise.all([
        fetch(`${SERVICE_LAYER_URL}/BusinessPartners/$count`, {
          headers: { "Cookie": `B1SESSION=${session.sessionId}` }
        }),
        fetch(`${SERVICE_LAYER_URL}/Items/$count`, {
          headers: { "Cookie": `B1SESSION=${session.sessionId}` }
        }),
        fetch(`${SERVICE_LAYER_URL}/Orders/$count`, {
          headers: { "Cookie": `B1SESSION=${session.sessionId}` }
        })
      ]);

      const totalPartners = partnersResponse.ok ? parseInt(await partnersResponse.text()) : 0;
      const activeItems = itemsResponse.ok ? parseInt(await itemsResponse.text()) : 0;
      const openOrders = ordersResponse.ok ? parseInt(await ordersResponse.text()) : 0;
      
      const timeRemaining = Math.ceil((session.expiresAt.getTime() - Date.now()) / 60000);
      const sessionTimeRemaining = `${Math.floor(timeRemaining / 60)}:${String(timeRemaining % 60).padStart(2, '0')}`;

      const stats: DashboardStats = {
        totalPartners,
        activeItems,
        openOrders,
        sessionTimeRemaining
      };

      res.json({
        success: true,
        data: stats
      } as ApiResponse<DashboardStats>);

    } catch (error) {
      console.error("Dashboard stats fetch error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch dashboard stats"
      } as ApiResponse<never>);
    }
  });

  // Get configuration endpoint
  app.get("/api/config", async (req, res) => {
    try {
      const config = {
        serviceLayerUrl: SERVICE_LAYER_URL,
        databaseName: DB_NAME,
        supportedEnvironments: ["HANA", "MSSQL"],
        sessionTimeout: 30
      };

      res.json({
        success: true,
        data: config
      } as ApiResponse<any>);

    } catch (error) {
      console.error("Config fetch error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch configuration"
      } as ApiResponse<never>);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
