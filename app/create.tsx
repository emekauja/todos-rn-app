import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  useColorScheme,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { ComponentProps, useMemo, useState } from 'react';
import { ThemedInput } from '@/components/ThemedInput';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { createTodo, editTodo } from '@/redux/slice/todo';
import { getMemoisedTodos } from '@/redux/selectors';

type IconButtonType = TouchableOpacityProps & {
  name: ComponentProps<typeof Ionicons>['name'];
};

function IconButton({ name, ...props }: IconButtonType) {
  const theme = useColorScheme() ?? 'light';

  return (
    <TouchableOpacity
      style={[styles.iconButton, { borderColor: Colors[theme].text }]}
      {...props}
    >
      <TabBarIcon size={20} name={name} color={Colors[theme].text} />
    </TouchableOpacity>
  );
}

export default function CreateScreen() {
  const param = useLocalSearchParams();
  const dispatch = useAppDispatch();
  const todoList = useAppSelector(getMemoisedTodos);

  const todo = useMemo(
    () => todoList.find((todo) => todo.id === param.id),
    [param]
  );

  const [title, setTitle] = useState(() => (todo?.title as string) ?? '');
  const [description, setDescription] = useState(
    () => (todo?.description as string) ?? ''
  );

  function handleClose() {
    router.navigate('/');
  }

  async function handleTodoCreation() {
    if (title && description) {
      if (!!todo?.id) {
        try {
          await dispatch(
            editTodo({
              id: todo.id,
              title,
              description,
              completed: todo.completed,
            })
          );
        } catch (err) {
          console.debug(err);
        }
      } else {
        try {
          await dispatch(
            createTodo({
              title,
              description,
            })
          );
        } catch (err) {
          console.debug(err);
        }
      }
      handleClose();
    } else {
      Alert.alert('Empty Field', 'please add title & description', [
        {
          text: 'Go home',
          onPress: handleClose,
          style: 'cancel',
        },
        { text: 'Continue', onPress: () => {} },
      ]);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <IconButton name="close" onPress={() => handleClose()} />

        <ThemedText type="title">
          {!todo?.id ? 'Create' : 'Edit'} Todo
        </ThemedText>
        <IconButton name="checkmark" onPress={() => handleTodoCreation()} />
      </ThemedView>

      <ThemedView style={styles.form}>
        <ThemedInput
          label="Title"
          value={title}
          onChangeText={(val) => setTitle(val)}
          placeholder="Do something fun!"
        />
        <ThemedInput
          label="Description"
          placeholder="Details about something fun..."
          style={{
            flex: 1,
            alignItems: 'flex-start',
            minHeight: 200,
            textAlignVertical: 'top',
          }}
          value={description}
          onChangeText={(val) => setDescription(val)}
          multiline={true}
          numberOfLines={5}
        />
      </ThemedView>
    </ThemedView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  iconButton: {
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'black',
    padding: 8,
    fontSize: 16,
    borderRadius: 200,
  },
  form: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 20,
  },
});
