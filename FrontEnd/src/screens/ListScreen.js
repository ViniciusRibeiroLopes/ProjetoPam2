import React, { useEffect, useState, useCallback } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import {
  FAB,
  ActivityIndicator,
  Snackbar,
  Searchbar,
  Surface,
  Text,
  useTheme,
  Portal,
  Dialog,
  Button,
  Paragraph,
} from "react-native-paper";
import { RefreshControl } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import api from "../services/api";
import RecordItem from "../components/RecordItem";

export default function ListScreen({ navigation }) {
  const theme = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({
    visible: false,
    id: null,
    name: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const resp = await api.get("/clientes");
      setData(resp.data || []);
    } catch (e) {
      console.error("Erro ao carregar:", e);
      setError("Falha ao carregar clientes. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const unsubscribe = navigation.addListener("focus", fetchData);
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const handleDelete = async () => {
    try {
      await api.delete(`/clientes/${deleteDialog.id}`);
      setDeleteDialog({ visible: false, id: null, name: "" });
      fetchData();
      setError("Cliente excluído com sucesso!");
    } catch {
      setError("Falha ao excluir cliente.");
    }
  };

  const confirmDelete = (item) => {
    setDeleteDialog({
      visible: true,
      id: item.id || item.ID,
      name: item.Nome,
    });
  };

  const filtered = data.filter((item) =>
    (item?.Nome || "").toLowerCase().includes(query.toLowerCase())
  );

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Icon
        name="account-group-outline"
        size={80}
        color={theme.colors.onSurfaceVariant}
      />
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        {query ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
      </Text>
      <Text variant="bodyMedium" style={styles.emptySubtitle}>
        {query
          ? "Tente buscar por outro nome"
          : "Clique no + para adicionar um novo cliente"}
      </Text>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Surface style={styles.searchContainer} elevation={1}>
        <Searchbar
          placeholder="Buscar por nome..."
          value={query}
          onChangeText={setQuery}
          style={styles.searchBar}
          icon="magnify"
        />
      </Surface>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Carregando clientes...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id || item.ID)}
          renderItem={({ item }) => (
            <RecordItem
              item={item}
              onEdit={(record) => navigation.navigate("Form", { record })}
              onDelete={() => confirmDelete(item)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={EmptyComponent}
          contentContainerStyle={
            filtered.length === 0 ? styles.emptyList : styles.list
          }
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate("Form")}
        label="Novo Cliente"
      />

      <Portal>
        <Dialog
          visible={deleteDialog.visible}
          onDismiss={() =>
            setDeleteDialog({ visible: false, id: null, name: "" })
          }
        >
          <Dialog.Title>Confirmar Exclusão</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Tem certeza que deseja excluir o cliente{" "}
              <Text style={{ fontWeight: "bold" }}>{deleteDialog.name}</Text>?
            </Paragraph>
            <Paragraph style={{ marginTop: 8, color: theme.colors.error }}>
              Esta ação não pode ser desfeita.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() =>
                setDeleteDialog({ visible: false, id: null, name: "" })
              }
            >
              Cancelar
            </Button>
            <Button onPress={handleDelete} textColor={theme.colors.error}>
              Excluir
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError("")}
        duration={3000}
        action={{
          label: "OK",
          onPress: () => setError(""),
        }}
        style={error.includes("sucesso") ? styles.successSnackbar : {}}
      >
        {error}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBar: {
    elevation: 0,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    marginTop: 24,
    textAlign: "center",
    opacity: 0.8,
  },
  emptySubtitle: {
    marginTop: 8,
    textAlign: "center",
    opacity: 0.6,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
  successSnackbar: {
    backgroundColor: "#4CAF50",
  },
});
