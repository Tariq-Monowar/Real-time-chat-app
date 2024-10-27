import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  Platform,
  TouchableNativeFeedback,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useThemeColors} from '../context/ThemeContext';
import {UseAppContext} from '../context/AppContext';
import {getLocalData} from '../utils/asyncstorage';
import axios from 'axios';
import {Chat, User} from '../interface/Interface';

const TouchableComponent =
  Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;

const Overview = () => {
  const {appBackground, textColor} = useThemeColors();
  const navigation = useNavigation<any>();
  const [allChat, setAllChat] = useState([]);

  const handleStartedChat = (chat: any) => {
    navigation.navigate('chat', {chat});
  };

  const findAllChat = async () => {
    try {
      const token = await getLocalData('token');
      if (!token) {
        console.error('Token not found!');
        return;
      }

      const {data} = await axios.get('http://10.0.2.2:1000/chat/', {
        headers: {
          Authorization: `${token}`,
        },
      });
      console.log(100000, data);
      setAllChat(data);
    } catch (error) {
      console.log(error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      findAllChat();
    }, [])
  );

  return (
    <View style={[styles.container, {backgroundColor: appBackground}]}>
      <ScrollView contentContainerStyle={styles.chatList}>
        {allChat?.map((chat: Chat) => {
          console.log(chat)
          const users = chat.users || [];
          const otherUser = users.length > 1 ? users[0] : users[1];
          const userAvatar = otherUser?.pic || '';
          const displayAvatar =
            userAvatar !==
            'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg';

          return (
            <TouchableOpacity
              onPress={() => handleStartedChat(chat)}
              style={styles.chatItem}
              key={chat.id}>
              <View style={styles.avatarContainer}>
                {displayAvatar ? (
                  <Image source={{uri: userAvatar}} style={styles.avatar} />
                ) : (
                  <View style={styles.withoutAvatar}>
                    <Text style={styles.withoutAvatarText}>
                      {otherUser?.name?.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.chatInfo}>
                <Text style={[styles.userName, {color: textColor}]}>
                  {otherUser?.name}
                </Text>
                <Text style={[styles.latestMessage, {color: textColor}]}>
                  {chat.latestMessage?.content || 'No messages yet'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default Overview;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  chatList: {
    paddingBottom: 20,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  withoutAvatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  withoutAvatarText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  latestMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
});
