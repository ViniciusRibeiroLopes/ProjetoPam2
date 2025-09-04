import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";

// ⚠️ Coloque o IP da sua máquina aqui no lugar do 192.168.0.10
const API_BASE_URL = "http://192.168.15.4:3000";

export default function App() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentClient, setCurrentClient] = useState({
    id: null,
    Nome: "",
    Idade: "",
    UF: "",
  });

  useEffect(() => {
    loadClientes();
  }, []);

  // Carregar clientes
  const loadClientes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}`);
      if (response.ok) {
        const data = await response.json();
        const clientesFormatados = data.map((c) => ({
          ...c,
          id: c.id || c.ID || c.IdCliente,
        }));
        setClientes(clientesFormatados);
      } else {
        Alert.alert("Erro", "Falha ao carregar clientes");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível conectar ao servidor");
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar cliente
  const addCliente = async () => {
    if (!currentClient.Nome || !currentClient.Idade || !currentClient.UF) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/clientes/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Nome: currentClient.Nome,
          Idade: parseInt(currentClient.Idade),
          UF: currentClient.UF,
        }),
      });

      if (response.ok) {
        const novo = await response.json();
        setClientes((prev) => [...prev, { ...novo, id: novo.id || novo.ID }]);
        resetForm();
        Alert.alert("Sucesso", "Cliente adicionado com sucesso!");
      } else {
        Alert.alert("Erro", "Falha ao adicionar cliente");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível conectar ao servidor");
      console.error("Erro ao adicionar cliente:", error);
    }
  };

  // Atualizar cliente
  const updateCliente = async () => {
    if (!currentClient.Nome || !currentClient.Idade || !currentClient.UF) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/clientes/${currentClient.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Nome: currentClient.Nome,
            Idade: parseInt(currentClient.Idade),
            UF: currentClient.UF,
          }),
        }
      );

      if (response.ok) {
        const atualizado = await response.json();
        setClientes((prev) =>
          prev.map((c) =>
            c.id === atualizado.id ? { ...atualizado, id: atualizado.id } : c
          )
        );
        resetForm();
        Alert.alert("Sucesso", "Cliente atualizado com sucesso!");
      } else {
        Alert.alert("Erro", "Falha ao atualizar cliente");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível conectar ao servidor");
      console.error("Erro ao atualizar cliente:", error);
    }
  };

  // Deletar cliente
  // Novo estado para controle do modal de exclusão
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteClientId, setDeleteClientId] = useState(null);

  // Abrir modal de confirmação
  const confirmDeleteCliente = (id) => {
    setDeleteClientId(id);
    setDeleteModalVisible(true);
  };

  // Excluir cliente
  const handleDeleteCliente = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/clientes/${deleteClientId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setClientes((prev) => prev.filter((c) => c.id !== deleteClientId));
        setDeleteModalVisible(false);
      } else {
        Alert.alert("Erro", "Falha ao deletar cliente");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível conectar ao servidor");
      console.error("Erro ao deletar cliente:", error);
    }
  };

  // Abrir modal para adicionar cliente
  const openAddModal = () => {
    setEditMode(false);
    setCurrentClient({ id: null, Nome: "", Idade: "", UF: "" });
    setModalVisible(true);
  };

  // Abrir modal para editar cliente
  const openEditModal = (cliente) => {
    setEditMode(true);
    setCurrentClient({
      id: cliente.id,
      Nome: cliente.Nome,
      Idade: cliente.Idade.toString(),
      UF: cliente.UF,
    });
    setModalVisible(true);
  };

  // Resetar formulário
  const resetForm = () => {
    setCurrentClient({ id: null, Nome: "", Idade: "", UF: "" });
    setModalVisible(false);
    setEditMode(false);
  };

  // Renderizar item
  const renderClienteItem = ({ item }) => (
    <View style={styles.clienteItem}>
      <View style={styles.clienteInfo}>
        <Text style={styles.clienteNome}>{item.Nome}</Text>
        <Text style={styles.clienteDetalhes}>
          Idade: {item.Idade} | UF: {item.UF}
        </Text>
      </View>
      <View style={styles.clienteActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => confirmDeleteCliente(item.id)}
        >
          <Text style={styles.actionButtonText}>Deletar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2196F3" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gerenciador de Clientes</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Adicionar</Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <FlatList
        data={clientes}
        keyExtractor={(item, index) => (item.id || item.ID || index).toString()}
        renderItem={renderClienteItem}
        refreshing={loading}
        onRefresh={loadClientes}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum cliente encontrado</Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={loadClientes}
            >
              <Text style={styles.refreshButtonText}>Recarregar</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={resetForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {editMode ? "Editar Cliente" : "Adicionar Cliente"}
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nome:</Text>
                <TextInput
                  style={styles.textInput}
                  value={currentClient.Nome}
                  onChangeText={(text) =>
                    setCurrentClient({ ...currentClient, Nome: text })
                  }
                  placeholder="Digite o nome do cliente"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Idade:</Text>
                <TextInput
                  style={styles.textInput}
                  value={currentClient.Idade}
                  onChangeText={(text) =>
                    setCurrentClient({ ...currentClient, Idade: text })
                  }
                  placeholder="Digite a idade"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>UF:</Text>
                <TextInput
                  style={styles.textInput}
                  value={currentClient.UF}
                  onChangeText={(text) =>
                    setCurrentClient({
                      ...currentClient,
                      UF: text.toUpperCase(),
                    })
                  }
                  placeholder="Digite a UF (ex: SP)"
                  maxLength={2}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={resetForm}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={editMode ? updateCliente : addCliente}
                >
                  <Text style={styles.modalButtonText}>
                    {editMode ? "Atualizar" : "Salvar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirmar Exclusão</Text>
            <Text style={{ textAlign: "center", marginBottom: 20 }}>
              Deseja realmente excluir este cliente?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeleteCliente}
              >
                <Text style={styles.modalButtonText}>Deletar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    backgroundColor: "#2196F3",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
  },
  headerTitle: { color: "white", fontSize: 20, fontWeight: "bold" },
  addButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  addButtonText: { color: "white", fontWeight: "bold" },
  listContainer: { padding: 10 },
  clienteItem: {
    backgroundColor: "white",
    marginBottom: 10,
    padding: 15,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  clienteInfo: { flex: 1 },
  clienteNome: { fontSize: 18, fontWeight: "bold", color: "#333" },
  clienteDetalhes: { fontSize: 14, color: "#666", marginTop: 5 },
  clienteActions: { flexDirection: "row" },
  actionButton: {
    marginLeft: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  editButton: { backgroundColor: "#FF9800" },
  deleteButton: { backgroundColor: "#f44336" },
  actionButtonText: { color: "white", fontSize: 12, fontWeight: "bold" },
  emptyContainer: { flex: 1, alignItems: "center", marginTop: 50 },
  emptyText: { fontSize: 16, color: "#666", marginBottom: 20 },
  refreshButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  refreshButtonText: { color: "white", fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  inputContainer: { marginBottom: 15 },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
    fontWeight: "500",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  modalButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  cancelButton: { backgroundColor: "#757575" },
  saveButton: { backgroundColor: "#4CAF50" },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
