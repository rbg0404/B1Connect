import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sapLoginSchema, type SapSession, type ApiResponse, type BusinessPartner, type Item, type SalesOrder, type DashboardStats, type Database } from "@shared/schema";
import { z } from "zod";
import { readFileSync } from "fs";
import { join } from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Load configuration from config.json
  let config: any;
  try {
    const configPath = join(process.cwd(), 'config.json');
    config = JSON.parse(readFileSync(configPath, 'utf8'));
  } catch (error) {
    console.error('Failed to load config.json:', error);
    throw new Error('Configuration file not found or invalid');
  }

  // SAP B1 Service Layer configuration from config
  const SERVICE_LAYER_URL = config.ServiceLayerURL;
  const DEFAULT_USER = config.DefaultUser;
  const DEFAULT_PASS = config.DefaultPassword;

  // For development/testing - disable SSL certificate verification
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      const loginData = sapLoginSchema.parse(req.body);
      
      const payload = {
        UserName: loginData.username,
        Password: loginData.password,
        CompanyDB: loginData.database
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

  // Get items
  app.get("/api/items", async (req, res) => {
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

      const response = await fetch(`${SERVICE_LAYER_URL}/Items?$select=ItemCode,ItemName,ItemType,Valid,QuantityOnStock&$top=50`, {
        headers: {
          "Cookie": `B1SESSION=${session.sessionId}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({
          success: false,
          error: `Failed to fetch items: ${errorText}`
        } as ApiResponse<never>);
      }

      const sapData = await response.json();
      
      res.json({
        success: true,
        data: sapData.value || []
      } as ApiResponse<Item[]>);

    } catch (error) {
      console.error("Items fetch error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch items"
      } as ApiResponse<never>);
    }
  });

  // Get sales orders
  app.get("/api/sales-orders", async (req, res) => {
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

      const response = await fetch(`${SERVICE_LAYER_URL}/Orders?$select=DocEntry,DocNum,CardCode,CardName,DocDate,DocTotal,DocumentStatus&$top=50`, {
        headers: {
          "Cookie": `B1SESSION=${session.sessionId}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({
          success: false,
          error: `Failed to fetch sales orders: ${errorText}`
        } as ApiResponse<never>);
      }

      const sapData = await response.json();
      
      res.json({
        success: true,
        data: sapData.value || []
      } as ApiResponse<SalesOrder[]>);

    } catch (error) {
      console.error("Sales orders fetch error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch sales orders"
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

  // Get available databases endpoint
  app.get("/api/databases", async (req, res) => {
    try {
      console.log("Loading databases from config.json");
      
      // Transform config databases to our Database format
      const databases: Database[] = config.Databases.map((db: any) => ({
        name: db.Database,
        description: db.Name,
        environment: db.Type.includes("MSSQL") ? "MSSQL" : 
                    db.Type === "HANADB" ? "HANA" : "UNKNOWN"
      }));

      console.log("Available databases:", databases);

      res.json({
        success: true,
        data: databases
      } as ApiResponse<Database[]>);

    } catch (error) {
      console.error("Failed to load databases from config:", error);
      res.status(500).json({
        success: false,
        error: "Failed to load available databases"
      } as ApiResponse<never>);
    }
  });

  // Get locations (OLCT)
  app.get("/api/locations", async (req, res) => {
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

      const response = await fetch(`${SERVICE_LAYER_URL}/Locations?$top=100`, {
        headers: {
          "Cookie": `B1SESSION=${session.sessionId}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({
          success: false,
          error: `Failed to fetch locations: ${errorText}`
        } as ApiResponse<never>);
      }

      const sapData = await response.json();
      
      res.json({
        success: true,
        data: sapData.value || []
      } as ApiResponse<any[]>);

    } catch (error) {
      console.error("Locations fetch error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch locations"
      } as ApiResponse<never>);
    }
  });

  // Get branches (OUBR)
  app.get("/api/branches", async (req, res) => {
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

      const response = await fetch(`${SERVICE_LAYER_URL}/Branches?$top=100`, {
        headers: {
          "Cookie": `B1SESSION=${session.sessionId}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({
          success: false,
          error: `Failed to fetch branches: ${errorText}`
        } as ApiResponse<never>);
      }

      const sapData = await response.json();
      
      // Map Service Layer fields to UI expected format for branches
      const mappedData = (sapData.value || []).map((branch: any) => ({
        Code: branch.Code,
        Name: branch.Name,
        Description: branch.Name, // Use Name as Description fallback
        Disabled: branch.Disabled,
        Address: branch.Street, // Map Street to Address for UI
        City: branch.City,
        Country: branch.Country
      }));
      
      res.json({
        success: true,
        data: mappedData
      } as ApiResponse<any[]>);

    } catch (error) {
      console.error("Branches fetch error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch branches"
      } as ApiResponse<never>);
    }
  });

  // Get warehouses (OWHS)
  app.get("/api/warehouses", async (req, res) => {
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

      const response = await fetch(`${SERVICE_LAYER_URL}/Warehouses?$top=100`, {
        headers: {
          "Cookie": `B1SESSION=${session.sessionId}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({
          success: false,
          error: `Failed to fetch warehouses: ${errorText}`
        } as ApiResponse<never>);
      }

      const sapData = await response.json();
      
      // Map Service Layer fields to UI expected format for warehouses
      const mappedData = (sapData.value || []).map((warehouse: any) => ({
        WhsCode: warehouse.WarehouseCode,
        WhsName: warehouse.WarehouseName,
        Location: warehouse.Location,
        Inactive: warehouse.Inactive,
        Locked: warehouse.Locked,
        Address: warehouse.Street,
        Country: warehouse.Country,
        City: warehouse.City,
        BinActivat: warehouse.BinActivat
      }));
      
      res.json({
        success: true,
        data: mappedData
      } as ApiResponse<any[]>);

    } catch (error) {
      console.error("Warehouses fetch error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch warehouses"
      } as ApiResponse<never>);
    }
  });

  // Get configuration endpoint
  app.get("/api/config", async (req, res) => {
    try {
      const configData = {
        serviceLayerUrl: SERVICE_LAYER_URL,
        defaultUser: DEFAULT_USER,
        supportedEnvironments: ["HANA", "MSSQL"],
        sessionTimeout: 30,
        databaseCount: config.Databases.length
      };

      res.json({
        success: true,
        data: configData
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
