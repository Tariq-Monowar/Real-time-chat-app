import React, {FC, useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  TouchableNativeFeedback,
  Easing,
  Image,
} from 'react-native';
import {
  NavigationContainer,
  DrawerActions,
  useNavigation,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  Bars3BottomLeftIcon,
  CheckIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
} from 'react-native-heroicons/outline';
import Overview from '../screens/Overview';
import Toolbox from '../drawer/Toolbox';
import {useThemeColors} from '../context/ThemeContext';
import Search from '../screens/Search';

import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import Signup from '../screens/Signup';
import Login from '../screens/Login';
import {UseAppContext} from '../context/AppContext';
import Profile from '../screens/Profile';
import Chat from '../screens/Chat';

const {appHeader, textColor, wave, iconColor} = useThemeColors();

// Dynamically decide the correct Touchable component for platform
const TouchableComponent =
  Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;

// Reusable Header Icon Component
const HeaderIcon = ({IconComponent, onPress, size, marginLeft = 0}: any) => (
  <View style={{...styles.iconContainer, marginLeft: marginLeft}}>
    <TouchableComponent
      onPress={onPress}
      background={
        Platform.OS === 'android'
          ? TouchableNativeFeedback.Ripple(wave, true)
          : undefined
      }>
      <View style={styles.iconWrapper}>
        <IconComponent size={size} strokeWidth={2} color={textColor} />
      </View>
    </TouchableComponent>
  </View>
);

const DrawerNavigation: FC = () => {
  const navigation = useNavigation<any>();
  const Drawer = createDrawerNavigator();
  const {users} = UseAppContext();

  return (
    <Drawer.Navigator drawerContent={props => <Toolbox {...props} />}>
      <Drawer.Screen
        options={({navigation}) => ({
          headerLeft: () => (
            <HeaderIcon
              IconComponent={Bars3BottomLeftIcon}
              onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
              size={27}
              marginLeft={7}
            />
          ),
          headerTitle: () => (
            <Text style={[styles.headerTitle, {color: textColor}]}>
              Chat App
            </Text>
          ),
          headerRight: () => (
            <View style={styles.iconGroup}>
              <HeaderIcon
                IconComponent={MagnifyingGlassIcon}
                onPress={() => navigation.navigate('search')}
                size={25}
              />
              {users?.pic !==
              'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg' ? (
                <TouchableOpacity
                  onPress={() => navigation.navigate('profile')}>
                  <Image
                    source={{
                      uri: users?.pic,
                    }}
                    style={{
                      width: 37,
                      height: 37,
                      borderRadius: 25,
                      borderWidth: 1,
                      borderColor: '#666',
                      marginRight: 7,
                      marginLeft: 7,
                    }} // Adjust styling as needed
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => navigation.navigate('profile')}
                  style={styles.withoutAbator}>
                  <Text style={styles.withoutAbatorText}>
                    {users?.name.slice(0, 2).toUpperCase()}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ),

          headerStyle: {
            backgroundColor: appHeader,
            elevation: 5,
            shadowColor: iconColor,
          },
        })}
        name="home"
        component={Overview}
      />
    </Drawer.Navigator>
  );
};

const config: any = {
  animation: 'spring',
  config: {
    stiffness: 350, //goti++
    damping: 500,
    // mass: 10,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
};

const closeConfig: any = {
  animation: 'timing',
  config: {
    // stiffness: 950,
    duration: 250, // --goti
    easing: Easing.linear,
  },
};
const AppNavigation = () => {
  const Stack = createStackNavigator();
  const {users} = UseAppContext();
console.log(users)
  const [initialRoute, setInitialRoute] = useState('Signup');
  const [isLoading, setIsLoading] = useState(true);

  console.log(initialRoute);
  useEffect(() => {
    if (users) {
      setInitialRoute('overview');
    }
    setIsLoading(false);
  }, [users]);

  if (isLoading) {
    return null;
  }
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={'overview'}>
        <Stack.Screen
          options={{
            headerShown: false,
            transitionSpec: {
              open: config,
              close: closeConfig,
            },
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          }}
          name="Signup"
          component={Signup}
        />

        <Stack.Screen
          options={{
            headerShown: false,
          }}
          name="overview"
          component={DrawerNavigation}
        />

        <Stack.Screen
          // options={{headerShown: false}}
          options={{
            headerTitle: () => (
              <Text style={[styles.headerTitle, {color: textColor}]}>
                Search User
              </Text>
            ),
            transitionSpec: {
              open: config,
              close: closeConfig,
            },
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            headerStyle: {
              backgroundColor: appHeader,
              elevation: 5,
              shadowColor: iconColor,
            },
          }}
          name="search"
          component={Search}
        />

        <Stack.Screen
          options={{
            headerShown: false,
            transitionSpec: {
              open: config,
              close: closeConfig,
            },
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            headerStyle: {
              backgroundColor: appHeader,
              elevation: 5,
              shadowColor: iconColor,
            },
          }}
          name="Login"
          component={Login}
        />

        <Stack.Screen
          options={{
            // headerShown: false,
            transitionSpec: {
              open: config,
              close: closeConfig,
            },
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            headerStyle: {
              backgroundColor: appHeader,
              elevation: 5,
              shadowColor: iconColor,
            },
          }}
          name="profile"
          component={Profile}
        />

        <Stack.Screen
          options={({route}: any) => {
            let oneChats = route?.params?.chat?.users  

            let oneChatName = oneChats.filter((x: any) => x.id !== users?.id);

            return {
              headerTitle: () => (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginLeft: -20,
                  }}>
                  {users?.pic !==
                  'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg' ? (
                    <View
                    // onPress={() => navigation.navigate('profile')}
                    >
                      <Image
                        source={{
                          uri: users?.pic,
                        }}
                        style={{
                          width: 37,
                          height: 37,
                          borderRadius: 25,
                          borderWidth: 1,
                          borderColor: '#666',
                          marginRight: 7,
                          marginLeft: 7,
                        }} // Adjust styling as needed
                      />
                    </View>
                  ) : (
                    <View
                      // onPress={() => navigation.navigate('profile')}
                      style={{...styles.withoutAbator}}>
                      <Text style={styles.withoutAbatorText}>
                        {oneChatName[0]?.name?.slice(0, 2).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <Text
                    style={[
                      styles.headerTitle,
                      {color: textColor, marginLeft: 5},
                    ]}>
                    {oneChatName[0]?.name}
                  </Text>
                </TouchableOpacity>
              ),
              headerRight: () => (
                <View style={styles.iconGroup}>
                  <HeaderIcon
                    IconComponent={EllipsisVerticalIcon}
                    onPress={() => {}}
                    size={26}
                  />
                </View>
              ),
              // headerShown: false, // Uncomment if you want to hide the header
              transitionSpec: {
                open: config,
                close: closeConfig,
              },
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
              headerStyle: {
                backgroundColor: appHeader,
                elevation: 5,
                shadowColor: iconColor,
              },
            };
          }}
          name="chat"
          component={Chat}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;

const styles = StyleSheet.create({
  headerTitle: {
    fontFamily: 'MeriendaBold',
    fontSize: 18,
    marginTop: -8,
  },
  iconContainer: {
    borderRadius: 50,
    overflow: 'hidden',
  },
  iconWrapper: {
    padding: 7,
  },
  iconGroup: {
    flexDirection: 'row',
    marginRight: 9,
    gap: 4,
  },
  withoutAbator: {
    backgroundColor: '#c9dcff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#fff',
    marginRight: 7,
    marginLeft: 7,
    width: 39,
    height: 39,
  },
  withoutAbatorText: {
    fontWeight: 'bold',
    fontSize: 17,
  },
});
