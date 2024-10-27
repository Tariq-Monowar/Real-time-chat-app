import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  ToastAndroid, // Import ToastAndroid for toast messages
} from 'react-native';
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  AtSymbolIcon,
  LockClosedIcon,
} from 'react-native-heroicons/outline';
import { useThemeColors } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { storeLocalData } from '../utils/asyncstorage';
import axios from 'axios';
import { UseAppContext } from '../context/AppContext';

const Signup = () => {
  const navigation = useNavigation<any>();
  const {setUsers} = UseAppContext()
  const { appBackground } = useThemeColors();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state

  const handleSignUp = async () => {
    setLoading(true);

    try {
      const { data } = await axios.post('http://10.0.2.2:1000/users/signup', { // Ensure this endpoint is correct
        name,
        email,
        password,
      });

      await storeLocalData('token', data.token);
      setUsers(data)
      navigation.navigate('overview');
    } catch (err) {

      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Login failed'
        : 'Network error, please try again later';

      ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };





  
  return (
    <View style={[styles.container, { backgroundColor: appBackground }]}>
      <KeyboardAvoidingView>
        <Text style={styles.title}>Create an Account</Text>

        {/* Name Input */}
        <View style={styles.inputContainer}>
          <UserIcon size={20} color="#6b7280" />
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <AtSymbolIcon size={20} color="#6b7280" />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <LockClosedIcon size={20} color="#6b7280" />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#9ca3af"
            secureTextEntry={!isPasswordVisible}
          />
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            {isPasswordVisible ? (
              <EyeIcon size={20} color="#6b7280" />
            ) : (
              <EyeSlashIcon size={20} color="#6b7280" />
            )}
          </TouchableOpacity>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          onPress={handleSignUp}
          style={styles.button}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" /> // Show loading indicator
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        {/* Sign In Link */}
        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    height: '100%',
  },
  title: {
    fontSize: 32,
    fontFamily: 'MeriendaBold',
    color: '#111827',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#111827',
  },
  button: {
    backgroundColor: '#4f46e5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  signInText: {
    fontSize: 14,
    color: '#6b7280',
  },
  signInLink: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '600',
  },
});
