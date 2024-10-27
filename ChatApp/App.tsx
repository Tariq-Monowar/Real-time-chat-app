import {StatusBar, StyleSheet, Text, View} from 'react-native';
import React, { useEffect } from 'react';
import AppNavigation from './navigation/AppNavigation';
import {AppContextProvider, UseAppContext} from './context/AppContext';
import { getLocalData } from './utils/asyncstorage';
import axios from 'axios';

const App = () => {

  return (
    <>
      <StatusBar
        translucent={true}
        barStyle="dark-content"
        backgroundColor={'transparent'}
      />
      <AppContextProvider>
        <AppNavigation />
      </AppContextProvider>
    </>
  );
};

export default App;

const styles = StyleSheet.create({});
