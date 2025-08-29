import React from 'react';
import { Card, Text, Button } from 'react-native-paper';
export default function RecordItem({ item, onEdit, onDelete }) {
  return (
    <Card style={{ marginVertical: 6 }}>
      <Card.Content>
        <Text variant="titleMedium">{item.Nome}</Text>
        <Text variant="bodyMedium">Idade: {item.Idade} — UF: {item.UF}</Text>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => onEdit(item)}>Editar</Button>
        <Button onPress={() => onDelete(item.id)}>Excluir</Button>
      </Card.Actions>
    </Card>
  );
}
