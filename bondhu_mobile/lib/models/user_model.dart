import 'dart:convert';

class UserModel {
  final String id;
  final String name;
  final String? email;
  final String? phone;
  final int age;
  final String gender;
  final String? bio;
  final List<String> images;
  final List<String> interests;
  final double? distance;
  final String? lookingFor;
  final String? occupation;
  final String? education;

  UserModel({
    required this.id,
    required this.name,
    this.email,
    this.phone,
    this.age = 22,
    this.gender = 'other',
    this.bio,
    this.images = const [],
    this.interests = const [],
    this.distance,
    this.lookingFor,
    this.occupation,
    this.education,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    List<String> parseList(dynamic field) {
      if (field == null) return [];
      if (field is List) return field.map((e) => e.toString()).toList();
      if (field is String) {
        try {
          final decoded = jsonDecode(field);
          if (decoded is List) return decoded.map((e) => e.toString()).toList();
        } catch (_) {}
      }
      return [];
    }

    return UserModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Anonymous',
      email: json['email']?.toString(),
      phone: json['phone']?.toString(),
      age: json['age'] is int ? json['age'] : (int.tryParse(json['age']?.toString() ?? '') ?? 22),
      gender: json['gender']?.toString() ?? 'other',
      bio: json['bio']?.toString(),
      images: parseList(json['images']),
      interests: parseList(json['interests']),
      distance: json['distance'] != null ? double.tryParse(json['distance'].toString()) : null,
      lookingFor: json['lookingFor']?.toString(),
      occupation: json['occupation']?.toString(),
      education: json['education']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'age': age,
      'gender': gender,
      'bio': bio,
      'images': images,
      'interests': interests,
      'lookingFor': lookingFor,
      'occupation': occupation,
      'education': education,
    };
  }
}
