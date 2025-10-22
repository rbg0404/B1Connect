class Database {
  final String name;
  final String description;
  final String environment;

  Database({
    required this.name,
    required this.description,
    required this.environment,
  });

  factory Database.fromJson(Map<String, dynamic> json) {
    return Database(
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      environment: json['environment'] ?? '',
    );
  }
}
