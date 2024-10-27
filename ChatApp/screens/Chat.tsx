import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import io, { Socket } from 'socket.io-client';
import { useThemeColors } from '../context/ThemeContext';
import { PaperAirplaneIcon } from 'react-native-heroicons/outline';
import axios from 'axios';
import { getLocalData } from '../utils/asyncstorage';
import { UseAppContext } from '../context/AppContext';
import { DefaultEventsMap } from '@socket.io/component-emitter';

interface Message {
  id: number;
  type: 'send' | 'receive';
  text: string;
  pic: string | any;
}

const SOCKET_SERVER_URL = 'http://10.0.2.2:1000'; // Ensure this is your backend server's address
let socket: Socket<DefaultEventsMap, DefaultEventsMap>;

const Chat = ({ route }: any) => {
  const chatId = route?.params?.chat?.id;
  const { appBackground, textColor } = useThemeColors();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { users } = UseAppContext(); // Assuming user context has userId

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const token = await getLocalData('token');

      if (!token) {
        console.error('Token not found!');
        return;
      }

      try {
        const { data } = await axios.get(
          `http://10.0.2.2:1000/message/${chatId}`,
          {
            headers: {
              Authorization: `${token}`,
            },
          },
        );

        const mappedMessages = data.map((msg: any) => ({
          id: msg.id,
          type: msg.senderId === users?.id ? 'send' : 'receive',
          text: msg.content,
          avatar:
            msg.sender.pic ||
            'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
        }));

        setMessages(mappedMessages);
        socket.emit('join chat', chatId); // Join the chat room
      } catch (error) {
        setError('Error fetching messages');
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [chatId]);

  const sendMsg = async () => {
    const token = await getLocalData('token');

    if (!token) {
      console.error('Token not found!');
      return;
    }

    if (message.trim()) {
      try {
        const response = await axios.post(
          'http://10.0.2.2:1000/message/',
          {
            content: message,
            chatId: chatId,
          },
          {
            headers: {
              Authorization: `${token}`,
            },
          },
        );

        const newMessage: Message = {
          id: response.data.id,
          type: 'send',
          text: message,
          pic: users?.pic,
        };

        setMessages(prevMessages => [newMessage, ...prevMessages]);
        socket.emit("send message", { ...response.data, chatId }); // Emit to room
        setMessage('');
      } catch (error) {
        setError('Error sending message');
        console.error('Error sending message:', error);
      }
    }
  };

  useEffect(() => {
    socket = io(SOCKET_SERVER_URL);

    socket.emit("setup", users);
    socket.on('connected', () => setSocketConnected(true));
    
    socket.on("newMessage", (newMessage) => {
      setMessages((prevMessages) => [newMessage, ...prevMessages]);
    });

    return () => {
      socket.off("newMessage");
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: appBackground }]}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          {error && <Text style={styles.errorText}>{error}</Text>}
          <FlatList
            data={messages}
            inverted
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }: any) => (
              <View
                style={[
                  styles.messageContainer,
                  item.type === 'send' ? styles.send : styles.receive,
                ]}>
                {item.type === 'receive' && (
                  <Image source={{ uri: item.avatar }} style={styles.avatar} />
                )}
                <View style={styles.messageBubble}>
                  <Text style={[styles.messageText, { color: textColor }]}>
                    {item.text}
                  </Text>
                </View>
              </View>
            )}
            contentContainerStyle={styles.messagesList}
          />

          <View style={styles.inputContainer}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              placeholderTextColor="grey"
              style={[styles.textInput, { color: textColor }]}
            />
            <TouchableOpacity onPress={sendMsg} style={styles.sendButton}>
              <PaperAirplaneIcon size={24} color="white" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default Chat;

// Keep your styles as they are


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  messagesList: {
    paddingBottom: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 5,
    alignItems: 'flex-end',
  },
  send: {
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  receive: {
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
    flexDirection: 'row',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#ececec',
  },
  messageText: {
    fontSize: 16,
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#f2f2f2',
    borderRadius: 30,
    marginHorizontal: 10,
    marginBottom: 10,
    marginTop: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 10,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 30,
    padding: 10,
    marginLeft: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});
function setSocketConnected(arg0: boolean): void {
  throw new Error('Function not implemented.');
}

