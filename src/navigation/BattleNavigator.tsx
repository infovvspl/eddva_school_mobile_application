import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BattleStackParamList } from '../types/navigation';
import BattleLobbyScreen from '../screens/battle/BattleLobbyScreen';
import BattleMatchmakerScreen from '../screens/battle/BattleMatchmakerScreen';
import BattleRoomCodeScreen from '../screens/battle/BattleRoomCodeScreen';
import BattleLiveScreen from '../screens/battle/BattleLiveScreen';
import BattleResultsScreen from '../screens/battle/BattleResultsScreen';
import BattleChallengeWaitScreen from '../screens/battle/BattleChallengeWaitScreen';

const Stack = createNativeStackNavigator<BattleStackParamList>();

const BattleNavigator = () => (
  <Stack.Navigator initialRouteName="BattleLobby" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="BattleLobby" component={BattleLobbyScreen} />
    <Stack.Screen name="BattleMatchmaker" component={BattleMatchmakerScreen} />
    <Stack.Screen name="BattleRoomCode" component={BattleRoomCodeScreen} />
    <Stack.Screen name="BattleChallengeWait" component={BattleChallengeWaitScreen} />
    <Stack.Screen name="BattleLive" component={BattleLiveScreen} />
    <Stack.Screen name="BattleResults" component={BattleResultsScreen} />
  </Stack.Navigator>
);

export default BattleNavigator;
