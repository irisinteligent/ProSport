import 'dart:convert';
import 'package:http/http.dart' as http;

class ProSportApi {
  // Tenta primeiro na SA-EAST1; se falhar, cai para US-CENTRAL1
  static const _endpoints = <String>[
    'https://southamerica-east1-prosport-portfolio.cloudfunctions.net/generateLanding',
    'https://us-central1-prosport-portfolio.cloudfunctions.net/generateLanding',
  ];

  static Future<Map<String, dynamic>> generateLanding({
    required String plano,
    required String nome,
    required String modalidade,
    required String imagem,
  }) async {
    final payload = {
      'plano': plano,
      'nome': nome,
      'modalidade': modalidade,
      'imagem': imagem,
    };

    for (final url in _endpoints) {
      try {
        final resp = await http.post(
          Uri.parse(url),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(payload),
        );

        final body = resp.body.isEmpty ? '{}' : resp.body;
        final json = jsonDecode(body) as Map<String, dynamic>;

        if (resp.statusCode == 200 && json['ok'] == true) {
          return json;
        }
        // Se não for 200/ok, tenta o próximo endpoint
      } catch (_) {
        // Tenta o próximo endpoint
      }
    }

    throw Exception('Falha ao gerar landing nos dois endpoints.');
  }
}
