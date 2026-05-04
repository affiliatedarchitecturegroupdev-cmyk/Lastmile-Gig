import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useMessaging } from '../hooks/useMessaging';

interface Message {
  id: string;
  senderId: string;
  type: 'text' | 'image' | 'voice' | 'order_update';
  content: string;
  timestamp: Date;
  read: boolean;
}

export default function ChatScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { conversationId, driverName, orderId } = route.params;
  const { messages, sendMessage, markRead, typing } = useMessaging(conversationId);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    markRead();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    await sendMessage({ content: inputText, type: 'text' });
    setInputText('');
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === 'me';
    
    return (
      <View style={[styles.message, isMe ? styles.myMessage : styles.theirMessage]}>
        <Text style={[styles.messageText, isMe && styles.myMessageText]}>
          {item.content}
        </Text>
        <Text style={[styles.time, isMe && styles.myTime]}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.driverName}>{driverName}</Text>
          <Text style={styles.orderId}>Order #{orderId}</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.callBtn}>📞</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messages}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <View style={styles.quickReplies}>
        {["On my way", "Arrived", "Call me"].map((reply) => (
          <TouchableOpacity
            key={reply}
            style={styles.quickReply}
            onPress={() => setInputText(reply)}
          >
            <Text style={styles.quickReplyText}>{reply}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachBtn}>
          <Text>📎</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendBtnText}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 48, backgroundColor: '#e63946' },
  backBtn: { fontSize: 24, color: '#fff', marginRight: 12 },
  headerInfo: { flex: 1 },
  driverName: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  orderId: { fontSize: 12, color: '#fff' },
  callBtn: { fontSize: 24 },
  messages: { padding: 16 },
  message: { maxWidth: '75%', padding: 12, borderRadius: 16, marginBottom: 8 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#e63946' },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: '#f0f0f0' },
  messageText: { fontSize: 16 },
  myMessageText: { color: '#fff' },
  time: { fontSize: 10, color: '#666', marginTop: 4 },
  myTime: { color: '#fff', opacity: 0.8 },
  quickReplies: { flexDirection: 'row', padding: 8, gap: 8 },
  quickReply: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  quickReplyText: { fontSize: 12, color: '#333' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: '#eee' },
  attachBtn: { padding: 8 },
  input: { flex: 1, backgroundColor: '#f5f5f5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginHorizontal: 8, maxHeight: 100 },
  sendBtn: { backgroundColor: '#e63946', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: '#ccc' },
  sendBtnText: { fontSize: 18, color: '#fff' },
});