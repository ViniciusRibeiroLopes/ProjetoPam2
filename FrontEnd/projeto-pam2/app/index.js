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

const API_BASE_URL = "http://localhost:3000";

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
        const novoCliente = {
          ...novo,
          id: novo.id || novo.ID || novo.IdCliente || Date.now(),
        };

        setClientes((prev) => [...prev, novoCliente]);
        resetForm();
        Alert.alert("Sucesso", "Cliente adicionado com sucesso!");
      } else {
        const errorData = await response.text();
        console.error("Erro do servidor:", errorData);
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
        const clienteAtualizado = {
          ...atualizado,
          id:
            atualizado.id ||
            atualizado.ID ||
            atualizado.IdCliente ||
            currentClient.id,
        };

        setClientes((prev) =>
          prev.map((c) => (c.id === currentClient.id ? clienteAtualizado : c))
        );
        resetForm();
        Alert.alert("Sucesso", "Cliente atualizado com sucesso!");
      } else {
        const errorData = await response.text();
        console.error("Erro do servidor:", errorData);
        Alert.alert("Erro", "Falha ao atualizar cliente");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível conectar ao servidor");
      console.error("Erro ao atualizar cliente:", error);
    }
  };

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
        // Atualizar o estado imediatamente
        setClientes((prev) => prev.filter((c) => c.id !== deleteClientId));
        setDeleteModalVisible(false);
        setDeleteClientId(null);
        Alert.alert("Sucesso", "Cliente deletado com sucesso!");
      } else {
        const errorData = await response.text();
        console.error("Erro do servidor:", errorData);
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
        <View style={styles.detailsRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.Idade} anos</Text>
          </View>
          <View style={[styles.badge, styles.ufBadge]}>
            <Text style={styles.badgeText}>{item.UF}</Text>
          </View>
        </View>
      </View>
      <View style={styles.clienteActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.actionButtonText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => confirmDeleteCliente(item.id)}
        >
          <Text style={styles.actionButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#667eea" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>👥 Gerenciador de Clientes</Text>
          <Text style={styles.headerSubtitle}>{clientes.length} clientes</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Novo</Text>
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
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Nenhum cliente encontrado</Text>
            <Text style={styles.emptyText}>
              Adicione o primeiro cliente para começar
            </Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={loadClientes}
            >
              <Text style={styles.refreshButtonText}>🔄 Recarregar</Text>
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
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editMode ? "✏️ Editar Cliente" : "➕ Novo Cliente"}
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>👤 Nome completo</Text>
                <TextInput
                  style={styles.textInput}
                  value={currentClient.Nome}
                  onChangeText={(text) =>
                    setCurrentClient({ ...currentClient, Nome: text })
                  }
                  placeholder="Digite o nome do cliente"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>🎂 Idade</Text>
                <TextInput
                  style={styles.textInput}
                  value={currentClient.Idade}
                  onChangeText={(text) =>
                    setCurrentClient({ ...currentClient, Idade: text })
                  }
                  placeholder="Digite a idade"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>📍 Estado (UF)</Text>
                <TextInput
                  style={styles.textInput}
                  value={currentClient.UF}
                  onChangeText={(text) =>
                    setCurrentClient({
                      ...currentClient,
                      UF: text.toUpperCase(),
                    })
                  }
                  placeholder="Ex: SP, RJ, MG..."
                  placeholderTextColor="#999"
                  maxLength={2}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={resetForm}
                >
                  <Text style={styles.modalButtonText}>Voltar</Text>
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
          <View style={[styles.modalContainer, styles.confirmModal]}>
            <Text style={styles.confirmIcon}>⚠️</Text>
            <Text style={styles.modalTitle}>Confirmar Exclusão</Text>
            <Text style={styles.confirmText}>
              Deseja realmente excluir este cliente? Esta ação não pode ser
              desfeita.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Voltar</Text>
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
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#667eea",
    paddingHorizontal: 20,
    paddingVertical: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "500",
  },
  addButton: {
    backgroundColor: "#48bb78",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 4,
    shadowColor: "#48bb78",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
    paddingTop: 20,
  },
  clienteItem: {
    backgroundColor: "white",
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#667eea",
  },
  clienteInfo: {
    flex: 1,
    marginRight: 12,
  },
  clienteNome: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  ufBadge: {
    backgroundColor: "#667eea",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4a5568",
  },
  clienteActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  editButton: {
    backgroundColor: "#ed8936",
  },
  deleteButton: {
    backgroundColor: "#e53e3e",
  },
  actionButtonText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4a5568",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#718096",
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 24,
  },
  refreshButton: {
    backgroundColor: "#667eea",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 4,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  refreshButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2d3748",
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: "#4a5568",
    fontWeight: "600",
  },
  textInput: {
    borderWidth: 2,
    borderColor: "#e2e8f0",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: "#f7fafc",
    color: "#2d3748",
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    paddingHorizontal: 8, // Adiciona espaço nas laterais
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16, // Aumentei de 10 para 16
    paddingHorizontal: 20, // Adicionei padding horizontal
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginHorizontal: 6, // Espaçamento entre os botões
    minHeight: 50, // Altura mínima
    justifyContent: "center", // Centraliza verticalmente
    alignItems: "center", // Centraliza horizontalmente
  },
  cancelButton: {
    backgroundColor: "#6b7280", // Cor mais escura que #a0aec0
  },
  saveButton: {
    backgroundColor: "#48bb78",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  confirmModal: {
    alignItems: "center",
    maxWidth: 350,
  },
  confirmIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  confirmText: {
    textAlign: "center",
    marginBottom: 24,
    fontSize: 16,
    color: "#4a5568",
    lineHeight: 24,
  },
});
