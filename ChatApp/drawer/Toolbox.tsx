import { StyleSheet, Text, View } from 'react-native'
import React, { FC } from 'react'
import { DrawerContentComponentProps } from '@react-navigation/drawer'

const Toolbox: FC<DrawerContentComponentProps> = () => {
  return (
    <View>
      <Text>Toolbox</Text>
    </View>
  )
}

export default Toolbox

const styles = StyleSheet.create({})