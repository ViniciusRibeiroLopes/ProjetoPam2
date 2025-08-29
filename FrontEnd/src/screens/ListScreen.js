import React, { useEffect, useState, useCallback } from 'react';
import { View, RefreshControl } from 'react-native';
import { FAB, ActivityIndicator, Snackbar, Searchbar } from 'react-native-paper';
import api from '../services/api';
import RecordItem from '../components/RecordItem';
import { FlatList } from 'react-native';
export default function ListScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const fetchData = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/clientes');
      setData(resp.data || []);
    } catch (e) {
      setError('Falha ao carregar clientes.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const unsub = navigation.addListener('focus', fetchData);
    return unsub;
  }, [navigation]);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);
  const filtered = data.filter((i) => 
    (i?.Nome || '').toLowerCase().includes(query.toLowerCase())
  );
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Searchbar placeholder="Buscar por nome..." value={query} onChangeText={setQuery} style={{ marginBottom: 12 }} />
      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <RecordItem
              item={item}
              onEdit={(row) => navigation.navigate('Form', { record: row })}
              onDelete={async (id) => {
                try {
                  await api.delete(`/clientes/${id}`);
                  fetchData();
                } catch {
                  setError('Falha ao excluir.');
                }
              }}
            />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
      <FAB icon="plus" style={{ position: 'absolute', right: 16, bottom: 16 }} onPress={() => navigation.navigate('Form')} />
      <Snackbar visible={!!error} onDismiss={() => setError('')} duration={2500}>{error}</Snackbar>
    </View>
  );
}
