import { useEffect, useState, useRef } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image } from "react-native";
import { Feather } from '@expo/vector-icons';
import { supabase } from "@/lib/supabase";
import { getUser } from "@/lib/queries";

export type Message = {
  id: number;
  user_id: string;
  house_id: number;
  content: string;
  created_at: string;
};

export const ChatModal = ({ visible, onClose, houseId }: { visible: boolean; onClose: () => void; houseId: number }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userMap, setUserMap] = useState<Record<string, { full_name: string; avatar_url?: string }>>({});

  const houseMap: Record<number, string> = {
    1: 'Atelier',
    2: 'Casa',
    3: 'Jiā',
  };

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser();
      setUserId(user?.id || null);
    };
    fetchUser();

    const fetchNeighbors = async () => {
      const { data, error } = await supabase
        .from('neighbors')
        .select('*')
        .eq('house', houseMap[houseId]);

      if (!error && data) {
        const map: Record<string, { full_name: string; avatar_url?: string }> = {};
        data.forEach((u: any) => {
          map[u.slack_id] = { full_name: u.full_name, avatar_url: u.avatar_url };
        });
        setUserMap(map);
      }
    };

    if (houseId) fetchNeighbors();
  }, [houseId]);

  useEffect(() => {
    if (!visible) return;
    let channel: any;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('house_id', houseId)
        .order('created_at', { ascending: true });

      if (!error && data) setMessages(data);
    };

    fetchMessages();

    channel = supabase.channel('messages-' + houseId).on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `house_id=eq.${houseId}`
      },
      (payload: any) => {
        setMessages((prev) => [...prev, payload.new]);
      }
    ).subscribe(() => {
      console.log('Subscribed to messages channel for house:', houseId);
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [visible, houseId]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const { data, error } = await supabase.from('messages').insert({
      content: input,
      house_id: houseId,
      user_id: userId
    }).select();
    setInput("");
    if (!error && data && data[0]) {
      setMessages((prev) => [...prev, data[0]]);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Chat</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={22} color="#333" />
            </TouchableOpacity>
          </View>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const user = userMap[item.user_id] || {};
              const createdAt = new Date(item.created_at);
              const formattedDateTime = createdAt.toLocaleString('ro-RO', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <View style={styles.messageItem}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                    {user.avatar_url && (
                      <View style={styles.avatarWrapper}>
                        <Image
                          source={{ uri: user.avatar_url }}
                          style={styles.avatar}
                        />
                      </View>
                    )}
                    <Text style={styles.senderName}>{user.full_name || 'Anon'}</Text>
                  </View>
                  <Text style={styles.messageText}>{item.content}</Text>
                  <Text style={styles.messageTime}>{formattedDateTime}</Text>
                </View>
              );
            }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type a message..."
            />
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
              <Feather name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    height: '70%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A154B',
  },
  messageItem: {
    marginBottom: 8,
    backgroundColor: '#F3EAF7',
    borderRadius: 8,
    padding: 8,
  },
  senderName: {
    fontWeight: 'bold',
    color: '#4A154B',
    marginRight: 6,
  },
  messageText: {
    fontSize: 15,
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    color: '#888',
    textAlign: 'right',
    marginTop: 4,
  },
  avatarWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 6,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 15,
    backgroundColor: '#fafafa',
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#4A154B',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
