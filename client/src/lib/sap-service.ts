import { apiRequest } from "./queryClient";
import type { SapLoginRequest, BusinessPartner, DashboardStats, ApiResponse } from "@shared/schema";

export class SapService {
  static async login(credentials: SapLoginRequest): Promise<ApiResponse<any>> {
    const response = await apiRequest("POST", "/api/login", credentials);
    return response.json();
  }

  static async logout(): Promise<ApiResponse<any>> {
    const response = await apiRequest("POST", "/api/logout");
    return response.json();
  }

  static async getSession(): Promise<ApiResponse<any>> {
    const response = await apiRequest("GET", "/api/session");
    return response.json();
  }

  static async getBusinessPartners(): Promise<ApiResponse<BusinessPartner[]>> {
    const response = await apiRequest("GET", "/api/business-partners");
    return response.json();
  }

  static async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const response = await apiRequest("GET", "/api/dashboard-stats");
    return response.json();
  }
}
