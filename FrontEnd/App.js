import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StatusBar,
} from "react-native";

const API_URL = "http://192.168.15.4:3000";

export default function App() {
  const [clientes, setClientes] = React.useState([]);
  const [nome, setNome] = React.useState("");
  const [idade, setIdade] = React.useState("");
  const [uf, setUf] = React.useState("");
  const [selectedId, setSelectedId] = React.useState(null);

  const fetchClientes = async () => {
    try {
      const response = await fetch(`${API_URL}/`);
      const data = await response.json();
      setClientes(data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      Alert.alert("Erro", "Não foi possível buscar os clientes.");
    }
  };

  React.useEffect(() => {
    fetchClientes();
  }, []);

  const handleAdicionarCliente = async () => {
    if (!nome || !idade || !uf) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos.");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/clientes/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Nome: nome, Idade: idade, UF: uf }),
      });
      if (response.ok) {
        Alert.alert("✓ Sucesso", "Cliente adicionado com sucesso!");
        setNome("");
        setIdade("");
        setUf("");
        fetchClientes();
      } else {
        Alert.alert("Erro", "Não foi possível adicionar o cliente.");
      }
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error);
      Alert.alert("Erro", "Ocorreu um erro ao adicionar o cliente.");
    }
  };

  const handleSelecionarCliente = (cliente) => {
    setSelectedId(cliente.id);
    setNome(cliente.Nome);
    setIdade(cliente.Idade.toString());
    setUf(cliente.UF);
  };

  const handleAtualizarCliente = async () => {
    if (!selectedId) {
      Alert.alert("Aviso", "Selecione um cliente para atualizar.");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/clientes/${selectedId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Nome: nome, Idade: idade, UF: uf }),
      });
      if (response.ok) {
        Alert.alert("✓ Sucesso", "Cliente atualizado com sucesso!");
        setNome("");
        setIdade("");
        setUf("");
        setSelectedId(null);
        fetchClientes();
      } else {
        Alert.alert("Erro", "Não foi possível atualizar o cliente.");
      }
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      Alert.alert("Erro", "Ocorreu um erro ao atualizar o cliente.");
    }
  };

  const handleDeletarCliente = async (id) => {
    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza que deseja deletar este cliente?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/clientes/${id}`, {
                method: "DELETE",
              });
              if (response.ok) {
                Alert.alert("✓ Sucesso", "Cliente deletado com sucesso!");
                fetchClientes();
              } else {
                Alert.alert("Erro", "Não foi possível deletar o cliente.");
              }
            } catch (error) {
              console.error("Erro ao deletar cliente:", error);
              Alert.alert("Erro", "Ocorreu um erro ao deletar o cliente.");
            }
          },
        },
      ]
    );
  };

  const clearForm = () => {
    setNome("");
    setIdade("");
    setUf("");
    setSelectedId(null);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.clientCard, selectedId === item.id && styles.selectedCard]}
      onPress={() => handleSelecionarCliente(item)}
      activeOpacity={0.7}
    >
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{item.Nome}</Text>
        <Text style={styles.clientDetails}>
          {item.Idade} anos • {item.UF}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeletarCliente(item.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <View style={styles.header}>
        <Text style={styles.title}>Clientes</Text>
        <Text style={styles.subtitle}>
          {clientes.length} {clientes.length === 1 ? "cliente" : "clientes"}
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          placeholderTextColor="#999"
          value={nome}
          onChangeText={setNome}
        />
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.inputHalf]}
            placeholder="Idade"
            placeholderTextColor="#999"
            value={idade}
            onChangeText={setIdade}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.inputHalf]}
            placeholder="UF"
            placeholderTextColor="#999"
            value={uf}
            onChangeText={setUf}
            maxLength={2}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={
              selectedId ? handleAtualizarCliente : handleAdicionarCliente
            }
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              {selectedId ? "Atualizar" : "Adicionar"}
            </Text>
          </TouchableOpacity>

          {selectedId && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={clearForm}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.listContainer}>
        {clientes.length > 0 ? (
          <FlatList
            data={clientes}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Nenhum cliente cadastrado ainda
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Adicione o primeiro cliente usando o formulário acima
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#212529",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6c757d",
    fontWeight: "500",
  },
  form: {
    backgroundColor: "#fff",
    padding: 24,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#212529",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#007bff",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  secondaryButtonText: {
    color: "#6c757d",
    fontSize: 16,
    fontWeight: "600",
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    gap: 12,
  },
  clientCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedCard: {
    borderColor: "#007bff",
    backgroundColor: "#f0f8ff",
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 4,
  },
  clientDetails: {
    fontSize: 14,
    color: "#6c757d",
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#6c757d",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: "#adb5bd",
    textAlign: "center",
    lineHeight: 22,
  },
});
