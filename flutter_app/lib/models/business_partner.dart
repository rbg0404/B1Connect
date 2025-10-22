class BusinessPartner {
  final String cardCode;
  final String cardName;
  final String cardType;
  final String valid;
  final double? currentAccountBalance;
  final String? currency;

  BusinessPartner({
    required this.cardCode,
    required this.cardName,
    required this.cardType,
    required this.valid,
    this.currentAccountBalance,
    this.currency,
  });

  factory BusinessPartner.fromJson(Map<String, dynamic> json) {
    return BusinessPartner(
      cardCode: json['CardCode'] ?? '',
      cardName: json['CardName'] ?? '',
      cardType: json['CardType'] ?? '',
      valid: json['Valid'] ?? '',
      currentAccountBalance: json['CurrentAccountBalance']?.toDouble(),
      currency: json['Currency'],
    );
  }
}
