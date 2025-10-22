class Item {
  final String itemCode;
  final String itemName;
  final String itemType;
  final String valid;
  final double? quantityOnStock;

  Item({
    required this.itemCode,
    required this.itemName,
    required this.itemType,
    required this.valid,
    this.quantityOnStock,
  });

  factory Item.fromJson(Map<String, dynamic> json) {
    return Item(
      itemCode: json['ItemCode'] ?? '',
      itemName: json['ItemName'] ?? '',
      itemType: json['ItemType'] ?? '',
      valid: json['Valid'] ?? '',
      quantityOnStock: json['QuantityOnStock']?.toDouble(),
    );
  }
}
