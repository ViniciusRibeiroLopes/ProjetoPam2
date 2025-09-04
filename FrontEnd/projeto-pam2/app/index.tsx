// index.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  ScrollView,
  RefreshControl,
  ListRenderItem,
  ActivityIndicator,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";

type ReactEl = React.ReactElement;

interface Cliente {
  id: number;
  Nome: string;
  Idade: number;
  UF: string;
}

interface ClienteFormData {
  Nome: string;
  Idade: number;
  UF: string;
}

const API_BASE_URL =
  Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

export default function App(): ReactEl {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // modais
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // edição
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [clienteParaExcluir, setClienteParaExcluir] = useState<Cliente | null>(
    null
  );

  // estados do formulário
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [uf, setUf] = useState("");

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/`);
      const data: Cliente[] = await response.json();
      console.log("CLIENTES LISTADOS:", data);
      setClientes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = (): void => {
    setRefreshing(true);
    fetchClientes();
  };

  const openModal = (cliente: Cliente | null = null): void => {
    if (cliente) {
      setEditingCliente(cliente);
      setNome(cliente.Nome);
      setIdade(String(cliente.Idade));
      setUf(cliente.UF);
    } else {
      setEditingCliente(null);
      setNome("");
      setIdade("");
      setUf("");
    }
    setModalVisible(true);
  };

  const closeModal = (): void => {
    setModalVisible(false);
    setEditingCliente(null);
    setNome("");
    setIdade("");
    setUf("");
  };

  const saveCliente = async (): Promise<void> => {
    if (!nome.trim() || !idade.trim() || !uf.trim()) {
      alert("Todos os campos são obrigatórios");
      return;
    }

    const idadeNum = Number(idade);
    if (!Number.isInteger(idadeNum) || idadeNum <= 0) {
      alert("Idade deve ser um número válido");
      return;
    }

    try {
      const clienteData: ClienteFormData = {
        Nome: nome.trim(),
        Idade: idadeNum,
        UF: uf.trim().toUpperCase(),
      };

      const url = editingCliente
        ? `${API_BASE_URL}/clientes/${editingCliente.id}`
        : `${API_BASE_URL}/clientes`;
      const method = editingCliente ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clienteData),
      });

      const data = await response.json();
      console.log("RESPOSTA API (saveCliente):", data);

      if (!response.ok) throw new Error("Erro ao salvar cliente");

      closeModal();
      fetchClientes();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
    }
  };

  // abrir modal de exclusão
  const confirmarExclusao = (cliente: Cliente): void => {
    setClienteParaExcluir(cliente);
    setDeleteModalVisible(true);
  };

  // excluir de fato
  const excluirCliente = async (): Promise<void> => {
    if (!clienteParaExcluir) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/clientes/${clienteParaExcluir.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      console.log("RESPOSTA API (excluirCliente):", data);

      if (!response.ok) throw new Error("Erro ao excluir cliente");

      setDeleteModalVisible(false);
      setClienteParaExcluir(null);
      fetchClientes();
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
    }
  };

  const renderCliente: ListRenderItem<Cliente> = ({ item }) => (
    <View style={styles.clienteCard}>
      <View style={styles.clienteInfo}>
        <Text style={styles.clienteNome}>{item.Nome}</Text>
        <Text style={styles.clienteDetalhes}>
          Idade: {item.Idade} anos • UF: {item.UF}
        </Text>
      </View>
      <View style={styles.clienteActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => openModal(item)}
        >
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton, { marginLeft: 10 }]}
          onPress={() => confirmarExclusao(item)}
        >
          <Text style={styles.actionButtonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* header */}
      <View style={styles.header}>
        <Text style={styles.title}>Gerenciador de Clientes</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Text style={styles.addButtonText}>+ Novo Cliente</Text>
        </TouchableOpacity>
      </View>

      {/* lista */}
      {loading && clientes.length === 0 ? (
        <ActivityIndicator size="large" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={clientes}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCliente}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 50 }}>
              Nenhum cliente encontrado
            </Text>
          }
        />
      )}

      {/* Modal adicionar/editar */}
      <Modal transparent animationType="slide" visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {editingCliente ? "Editar Cliente" : "Novo Cliente"}
              </Text>

              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Nome"
              />
              <TextInput
                style={styles.input}
                value={idade}
                onChangeText={setIdade}
                placeholder="Idade"
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                value={uf}
                onChangeText={setUf}
                placeholder="UF"
                maxLength={2}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={closeModal}
                >
                  <Text>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={saveCliente}
                >
                  <Text style={{ color: "#fff" }}>
                    {editingCliente ? "Atualizar" : "Salvar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmação de exclusão */}
      <Modal transparent animationType="fade" visible={deleteModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Exclusão</Text>
            <Text style={{ marginBottom: 20 }}>
              Deseja excluir{" "}
              <Text style={{ fontWeight: "bold" }}>
                {clienteParaExcluir?.Nome}
              </Text>
              ?
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={excluirCliente}
              >
                <Text style={{ color: "#fff" }}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", paddingTop: 50 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
  },
  title: { fontSize: 20, fontWeight: "bold" },
  addButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: { color: "#fff", fontWeight: "600" },
  list: { flex: 1 },
  listContent: { padding: 15 },
  clienteCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  clienteInfo: { marginBottom: 12 },
  clienteNome: { fontSize: 18, fontWeight: "bold" },
  clienteDetalhes: { fontSize: 14, color: "#666" },
  clienteActions: { flexDirection: "row", justifyContent: "flex-end" },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButton: { backgroundColor: "#34C759" },
  deleteButton: { backgroundColor: "#FF3B30" },
  actionButtonText: { color: "#fff", fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  saveButton: { backgroundColor: "#007AFF" },
});
