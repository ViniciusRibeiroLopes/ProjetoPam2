import React from "react";
import { View, StyleSheet } from "react-native";
import {
  Card,
  Text,
  IconButton,
  useTheme,
  Chip,
  Avatar,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function RecordItem({ item, onEdit, onDelete }) {
  const theme = useTheme();

  // Extrai as iniciais do nome para o avatar
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0][0]?.toUpperCase() || "?";
  };

  // Cor do avatar baseada no nome
  const getAvatarColor = (name) => {
    if (!name) return theme.colors.primary;
    const colors = [
      "#f44336",
      "#e91e63",
      "#9c27b0",
      "#673ab7",
      "#3f51b5",
      "#2196f3",
      "#03a9f4",
      "#00bcd4",
      "#009688",
      "#4caf50",
      "#8bc34a",
      "#ff9800",
      "#ff5722",
      "#795548",
      "#607d8b",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Card style={styles.card} elevation={2}>
      <Card.Content style={styles.content}>
        <View style={styles.leftSection}>
          <Avatar.Text
            size={48}
            label={getInitials(item.Nome)}
            style={[
              styles.avatar,
              { backgroundColor: getAvatarColor(item.Nome) },
            ]}
          />
          <View style={styles.info}>
            <Text variant="titleMedium" style={styles.name}>
              {item.Nome || "Sem nome"}
            </Text>
            <View style={styles.details}>
              <Chip
                icon="calendar"
                style={styles.chip}
                textStyle={styles.chipText}
                compact
              >
                {item.Idade} anos
              </Chip>
              <Chip
                icon="map-marker"
                style={[styles.chip, styles.ufChip]}
                textStyle={styles.chipText}
                compact
              >
                {item.UF}
              </Chip>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <IconButton
            icon="pencil"
            iconColor={theme.colors.primary}
            size={22}
            onPress={() => onEdit(item)}
            style={styles.actionButton}
          />
          <IconButton
            icon="delete"
            iconColor={theme.colors.error}
            size={22}
            onPress={() => onDelete(item.id || item.ID)}
            style={styles.actionButton}
          />
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
    borderRadius: 12,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: "600",
    marginBottom: 6,
  },
  details: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  chip: {
    height: 26,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },
  ufChip: {
    backgroundColor: "rgba(33, 150, 243, 0.15)",
  },
  chipText: {
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    margin: 0,
  },
});
