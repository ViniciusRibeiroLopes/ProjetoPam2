import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button, TextInput, Snackbar } from 'react-native-paper';
import api from '../services/api';
export default function FormScreen({ route, navigation }) {
  const record = route?.params?.record;
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [uf, setUf] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (record) {
      setNome(record.Nome || '');
      setIdade(String(record.Idade || ''));
      setUf(record.UF || '');
    }
  }, [record]);
  const onSave = async () => {
    if (!nome?.trim()) { setError('Informe um nome.'); return; }
    setSaving(true);
    try {
      const payload = { Nome: nome, Idade: Number(idade) || null, UF: uf };
      if (record?.id) {
        await api.put(`/clientes/${record.id}`, payload);
      } else {
        await api.post('/clientes', payload);
      }
      navigation.goBack();
    } catch (e) {
      setError('Falha ao salvar.');
    } finally {
      setSaving(false);
    }
  };
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <TextInput label="Nome" value={nome} onChangeText={setNome} style={{ marginBottom: 12 }} />
      <TextInput label="Idade" value={idade} onChangeText={setIdade} keyboardType="numeric" style={{ marginBottom: 12 }} />
      <TextInput label="UF" value={uf} onChangeText={setUf} style={{ marginBottom: 12 }} />
      <Button mode="contained" onPress={onSave} loading={saving} disabled={saving}>{record?.id ? 'Atualizar' : 'Salvar'}</Button>
      <Snackbar visible={!!error} onDismiss={() => setError('')} duration={2500}>{error}</Snackbar>
    </View>
  );
}
