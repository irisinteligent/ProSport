import 'dart:convert';
import 'package:http/http.dart' as http;

class ProSportApi {
  // Tenta primeiro na SA-EAST1; se falhar, cai para US-CENTRAL1
  static const _endpoints = <String>[
    'https://southamerica-east1-prosport-portfolio.cloudfunctions.net/generateLanding',
    'https://us-central1-prosport-portfolio.cloudfunctions.net/generateLanding',
  ];

  // O endpoint agora exige o header x-api-key (secret LANDING_API_KEY das
  // Functions). Rode o app de QA com:
  //   flutter run --dart-define=PROSPORT_API_KEY=<valor-da-secret>
  // NUNCA hardcode a chave aqui — este arquivo é versionado.
  static const String _apiKey =
      String.fromEnvironment('PROSPORT_API_KEY', defaultValue: '');

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
          headers: {
            'Content-Type': 'application/json',
            if (_apiKey.isNotEmpty) 'x-api-key': _apiKey,
          },
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
