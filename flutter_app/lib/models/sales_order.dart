class SalesOrder {
  final int docEntry;
  final int docNum;
  final String cardCode;
  final String cardName;
  final String docDate;
  final double docTotal;
  final String documentStatus;

  SalesOrder({
    required this.docEntry,
    required this.docNum,
    required this.cardCode,
    required this.cardName,
    required this.docDate,
    required this.docTotal,
    required this.documentStatus,
  });

  factory SalesOrder.fromJson(Map<String, dynamic> json) {
    return SalesOrder(
      docEntry: json['DocEntry'] ?? 0,
      docNum: json['DocNum'] ?? 0,
      cardCode: json['CardCode'] ?? '',
      cardName: json['CardName'] ?? '',
      docDate: json['DocDate'] ?? '',
      docTotal: (json['DocTotal'] ?? 0).toDouble(),
      documentStatus: json['DocumentStatus'] ?? '',
    );
  }
}
