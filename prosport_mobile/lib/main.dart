import 'dart:convert';
import 'package:flutter/material.dart';
import 'services/prosport_api.dart';

void main() => runApp(const ProSportApp());

class ProSportApp extends StatelessWidget {
  const ProSportApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ProSport Teste',
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.indigo),
      home: const LandingTestPage(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class LandingTestPage extends StatefulWidget {
  const LandingTestPage({super.key});
  @override
  State<LandingTestPage> createState() => _LandingTestPageState();
}

class _LandingTestPageState extends State<LandingTestPage> {
  final _nome = TextEditingController(text: 'Beto Pernalonga');
  final _modalidade = TextEditingController(text: 'jiu-jitsu');
  final _imagem = TextEditingController(text: 'https://picsum.photos/seed/athlete/800/600');
  String _plano = 'basic';

  String _status = '(aguardando…)';
  String _saida = '';

  Future<void> _chamar() async {
    setState(() { _status = 'enviando…'; _saida = ''; });
    try {
      final json = await ProSportApi.generateLanding(
        plano: _plano,
        nome: _nome.text.trim(),
        modalidade: _modalidade.text.trim(),
        imagem: _imagem.text.trim(),
      );
      setState(() {
        _status = 'ok';
        _saida = const JsonEncoder.withIndent('  ').convert(json);
      });
    } catch (e) {
      setState(() {
        _status = 'erro';
        _saida = e.toString();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final mono = const TextStyle(fontFamily: 'monospace');

    return Scaffold(
      appBar: AppBar(title: const Text('Teste generateLanding')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(children: [
            const Text('Plano:'), const SizedBox(width: 12),
            DropdownButton<String>(
              value: _plano,
              items: const [
                DropdownMenuItem(value: 'basic', child: Text('basic')),
                DropdownMenuItem(value: 'plus', child: Text('plus')),
                DropdownMenuItem(value: 'premium', child: Text('premium')),
              ],
              onChanged: (v) => setState(() => _plano = v!),
            ),
            const SizedBox(width: 16),
            Text(_status, style: const TextStyle(color: Colors.grey)),
          ]),
          const SizedBox(height: 12),
          TextField(controller: _nome, decoration: const InputDecoration(labelText: 'nome')),
          TextField(controller: _modalidade, decoration: const InputDecoration(labelText: 'modalidade')),
          TextField(controller: _imagem, decoration: const InputDecoration(labelText: 'imagem (URL)')),
          const SizedBox(height: 12),
          ElevatedButton(onPressed: _chamar, child: const Text('Gerar Landing')),
          const SizedBox(height: 16),
          const Text('Resposta:'),
          SelectableText(_saida.isEmpty ? '(sem dados ainda)' : _saida, style: mono),
        ],
      ),
    );
  }
}
