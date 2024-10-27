import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {useThemeColors} from '../context/ThemeContext';
import {User} from '../interface/Interface';
import axios from 'axios';
import {UseAppContext} from '../context/AppContext';
import {getLocalData} from '../utils/asyncstorage';
import {useNavigation} from '@react-navigation/native';

const Search = () => {
  const {users} = UseAppContext();
  const navigation = useNavigation<any>();
  const {appBackground, textColor} = useThemeColors();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (text: string) => {
    setSearchTerm(text);
    let token = await getLocalData('token');

    if (text.length > 0) {
      setLoading(true);
      try {
        const {data} = await axios.get(
          `http://10.0.2.2:1000/users?search=${text}`,
          {
            headers: {
              Authorization: `${token}`,
            },
          },
        );
        setFilteredUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStartedChat = async (user: User) => {
    try {
      let token = await getLocalData('token');
      
      let { data } = await axios.post(
        `http://10.0.2.2:1000/chat/`,
        { userId: user.id },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
 
      if (data) navigation.navigate('chat', {chat: data});
    } catch (error) {
      console.log('Error starting chat:', error);
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: appBackground}]}>
      <View style={styles.searchBar}>
        <TextInput
          style={[styles.searchInput, {color: textColor}]}
          placeholder="Search for users..."
          placeholderTextColor={textColor}
          value={searchTerm}
          onChangeText={handleSearch}
        />
      </View>

      {loading ? (
        <Text style={[styles.loadingText, {color: textColor}]}>Loading...</Text>
      ) : (
        <ScrollView>
          {filteredUsers.length > 0
            ? filteredUsers.map((user: User) => (
                <TouchableOpacity
                  onPress={() => handleStartedChat(user)}
                  key={user.id}
                  style={styles.userItem}>
                  {user.pic !==
                  'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg' ? (
                    <Image
                      source={{
                        uri: user.pic,
                      }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.withoutAbator}>
                      <Text style={styles.withoutAbatorText}>
                        {user.name.slice(0, 2).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View>
                    <Text style={[styles.userName, {color: textColor}]}>
                      {user.name}
                    </Text>
                    <Text style={[styles.userEmail, {color: textColor}]}>
                      {user.email}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            : searchTerm.length >= 0 && (
                <Text style={[styles.noResults, {color: textColor}]}>
                  No users found
                </Text>
              )}
        </ScrollView>
      )}
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingLeft: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: '#777',
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  withoutAbator: {
    backgroundColor: '#c9dcff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#999',
    marginRight: 10,
    width: 49,
    height: 49,
  },
  withoutAbatorText: {
    fontWeight: 'bold',
    fontSize: 17,
  },
});
