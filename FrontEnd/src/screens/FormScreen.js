import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Button,
  TextInput,
  Snackbar,
  Surface,
  Text,
  HelperText,
  useTheme,
  Divider,
  Card,
  IconButton,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import api from "../services/api";

const UF_LIST = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

export default function FormScreen({ route, navigation }) {
  const theme = useTheme();
  const record = route?.params?.record;
  const isEditing = !!record;

  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [uf, setUf] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (record) {
      setNome(record.Nome || "");
      setIdade(String(record.Idade || ""));
      setUf(record.UF || "");
    }
  }, [record]);

  const validateForm = () => {
    const newErrors = {};

    if (!nome?.trim()) {
      newErrors.nome = "Nome é obrigatório";
    } else if (nome.trim().length < 3) {
      newErrors.nome = "Nome deve ter pelo menos 3 caracteres";
    }

    if (!idade?.trim()) {
      newErrors.idade = "Idade é obrigatória";
    } else if (isNaN(idade) || parseInt(idade) < 1 || parseInt(idade) > 150) {
      newErrors.idade = "Idade deve ser um número entre 1 e 150";
    }

    if (!uf?.trim()) {
      newErrors.uf = "UF é obrigatório";
    } else if (!UF_LIST.includes(uf.toUpperCase())) {
      newErrors.uf = "UF inválido. Use a sigla do estado (ex: SP, RJ)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSave = async () => {
    if (!validateForm()) {
      setError("Por favor, corrija os erros no formulário");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        Nome: nome.trim(),
        Idade: parseInt(idade),
        UF: uf.toUpperCase(),
      };

      if (isEditing) {
        await api.put(`/clientes/${record.id || record.ID}`, payload);
        setSuccess("Cliente atualizado com sucesso!");
      } else {
        await api.post("/clientes", payload);
        setSuccess("Cliente cadastrado com sucesso!");
      }

      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (e) {
      console.error("Erro ao salvar:", e);
      setError("Falha ao salvar. Verifique sua conexão.");
    } finally {
      setSaving(false);
    }
  };

  const clearForm = () => {
    setNome("");
    setIdade("");
    setUf("");
    setErrors({});
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.surface} elevation={2}>
          <View style={styles.header}>
            <Icon
              name={isEditing ? "account-edit" : "account-plus"}
              size={48}
              color={theme.colors.primary}
            />
            <Text variant="headlineSmall" style={styles.title}>
              {isEditing ? "Editar Cliente" : "Novo Cliente"}
            </Text>
            {isEditing && (
              <Text variant="bodyMedium" style={styles.subtitle}>
                ID: #{record.id || record.ID}
              </Text>
            )}
          </View>

          <Divider style={styles.divider} />

          <View style={styles.form}>
            <TextInput
              label="Nome Completo"
              value={nome}
              onChangeText={(text) => {
                setNome(text);
                if (errors.nome) {
                  setErrors({ ...errors, nome: "" });
                }
              }}
              mode="outlined"
              left={<TextInput.Icon icon="account" />}
              error={!!errors.nome}
              style={styles.input}
            />
            <HelperText type="error" visible={!!errors.nome}>
              {errors.nome}
            </HelperText>

            <TextInput
              label="Idade"
              value={idade}
              onChangeText={(text) => {
                setIdade(text);
                if (errors.idade) {
                  setErrors({ ...errors, idade: "" });
                }
              }}
              keyboardType="numeric"
              mode="outlined"
              left={<TextInput.Icon icon="calendar" />}
              error={!!errors.idade}
              style={styles.input}
            />
            <HelperText type="error" visible={!!errors.idade}>
              {errors.idade}
            </HelperText>

            <TextInput
              label="UF (Estado)"
              value={uf}
              onChangeText={(text) => {
                setUf(text.toUpperCase());
                if (errors.uf) {
                  setErrors({ ...errors, uf: "" });
                }
              }}
              mode="outlined"
              left={<TextInput.Icon icon="map-marker" />}
              error={!!errors.uf}
              maxLength={2}
              autoCapitalize="characters"
              style={styles.input}
              placeholder="Ex: SP, RJ, MG"
            />
            <HelperText type="error" visible={!!errors.uf}>
              {errors.uf}
            </HelperText>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={onSave}
              loading={saving}
              disabled={saving}
              icon={isEditing ? "check" : "content-save"}
              style={styles.saveButton}
            >
              {isEditing ? "Atualizar" : "Salvar"}
            </Button>

            {!isEditing && (
              <Button
                mode="outlined"
                onPress={clearForm}
                disabled={saving}
                icon="refresh"
                style={styles.clearButton}
              >
                Limpar
              </Button>
            )}
          </View>

          <Card style={styles.infoCard}>
            <Card.Content>
              <View style={styles.infoRow}>
                <Icon
                  name="information"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text variant="bodySmall" style={styles.infoText}>
                  Preencha todos os campos corretamente
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Icon
                  name="map-marker"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text variant="bodySmall" style={styles.infoText}>
                  Use a sigla do estado com 2 letras (ex: SP, RJ)
                </Text>
              </View>
            </Card.Content>
          </Card>
        </Surface>
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError("")}
        duration={3000}
        action={{
          label: "OK",
          onPress: () => setError(""),
        }}
        style={styles.errorSnackbar}
      >
        {error}
      </Snackbar>

      <Snackbar
        visible={!!success}
        onDismiss={() => setSuccess("")}
        duration={2000}
        style={styles.successSnackbar}
      >
        {success}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  surface: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    marginTop: 12,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.7,
  },
  divider: {
    marginVertical: 16,
  },
  form: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 4,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  saveButton: {
    paddingVertical: 8,
  },
  clearButton: {
    paddingVertical: 6,
  },
  infoCard: {
    marginTop: 20,
    backgroundColor: "rgba(33, 150, 243, 0.05)",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  infoText: {
    marginLeft: 8,
    opacity: 0.8,
  },
  errorSnackbar: {
    backgroundColor: "#f44336",
  },
  successSnackbar: {
    backgroundColor: "#4CAF50",
  },
});
