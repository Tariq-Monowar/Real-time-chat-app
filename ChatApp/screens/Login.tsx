import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ToastAndroid, // Import ToastAndroid for error messages
} from 'react-native';
import {
  EyeIcon,
  EyeSlashIcon,
  AtSymbolIcon,
  LockClosedIcon,
} from 'react-native-heroicons/outline';
import { useThemeColors } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { storeLocalData } from '../utils/asyncstorage';
import { UseAppContext } from '../context/AppContext';

const Login = () => {
  const navigation = useNavigation<any>();
  const {setUsers} = UseAppContext()
  const { appBackground } = useThemeColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    try {
      const { data } = await axios.post('http://10.0.2.2:1000/users/login', { // Ensure this endpoint is correct
        email,
        password,
      });

      await storeLocalData('token', data.token);
      setUsers(data)
      // console.log(data.token)
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
      <KeyboardAvoidingView behavior="padding">
        <Text style={styles.title}>Sign In</Text>

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

        {/* Sign In Button */}
        <TouchableOpacity
          onPress={handleLogin} // Use handleLogin instead of handleSignUp
          style={styles.button}
          disabled={loading} // Disable button while loading
        >
          <Text style={styles.buttonText}>
            {loading ? 'Loading...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        {/* Don't have an account? Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Login;

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
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  signUpText: {
    fontSize: 14,
    color: '#6b7280',
  },
  signUpLink: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '600',
  },
});
