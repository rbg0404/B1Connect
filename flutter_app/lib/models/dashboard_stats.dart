class DashboardStats {
  final int totalPartners;
  final int activeItems;
  final int openOrders;
  final String sessionTimeRemaining;

  DashboardStats({
    required this.totalPartners,
    required this.activeItems,
    required this.openOrders,
    required this.sessionTimeRemaining,
  });

  factory DashboardStats.fromJson(Map<String, dynamic> json) {
    return DashboardStats(
      totalPartners: json['totalPartners'] ?? 0,
      activeItems: json['activeItems'] ?? 0,
      openOrders: json['openOrders'] ?? 0,
      sessionTimeRemaining: json['sessionTimeRemaining'] ?? '0:00',
    );
  }
}
