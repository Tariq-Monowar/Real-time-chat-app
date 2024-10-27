import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react';
import axios from 'axios';

import {AppContextType, Chat, User} from '../interface/Interface';

import {getLocalData, storeLocalData} from '../utils/asyncstorage';

const defaultContextValue: AppContextType = {
  data: 'hi',
  users: undefined,
  setUsers: () => { },
  allChat: []
};

export const AppContext = createContext<AppContextType>(defaultContextValue);

export const UseAppContext = () => useContext(AppContext);

interface AppContextProviderProps {
  children: ReactNode;
}

export const AppContextProvider: React.FC<AppContextProviderProps> = ({
  children,
}) => {
  const [users, setUsers] = useState<User | undefined>();
  const [allChat, setAllChat] = useState<Chat[]>([]);

  console.log(users)
  const getProfile = async () => {
    try {
      const token = await getLocalData('token');
      if (!token) {
        console.error('Token not found!');
        return;
      }

      const {data} = await axios.get(
        'http://10.0.2.2:1000/users/check-access',
        {
          headers: {
            Authorization: `${token}`,
          },
        },
      );

      setUsers(data);
    } catch (error) {
      setUsers(undefined);
      
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);



  const findAllChat = async()=>{
    try {
      const token = await getLocalData('token');
      if (!token) {
        console.error('Token not found!');
        return;
      }

      const {data} = await axios.get(
        'http://10.0.2.2:1000/chat/',
        {
          headers: {
            Authorization: `${token}`,
          },
        },
      );
      setAllChat(data)
    
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    findAllChat()
  }, [])
 
  

  return (
    <AppContext.Provider
      value={{
        data: 'hi',
        users,
        setUsers,
        allChat
      }}>
      {children}
    </AppContext.Provider>
  );
};
