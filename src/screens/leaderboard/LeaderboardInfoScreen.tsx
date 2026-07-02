import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  NativeSyntheticEvent,
  useWindowDimensions,
  NativeScrollEvent,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import LeaderboardDarkHeader from '../../components/leaderboard/LeaderboardDarkHeader';
import LeaderboardInfoFooter from '../../components/leaderboard/LeaderboardInfoFooter';
import LeaderboardInfoPageBody from '../../components/leaderboard/LeaderboardInfoPageBody';
import { LB_COLORS, LEADERBOARD_INFO_PAGES } from '../../constants/leaderboardXp';
import type { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'LeaderboardInfo'>;

const LeaderboardInfoScreen: React.FC<Props> = ({ navigation, route }) => {
  const { width: pageWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);
  const startPage = route.params?.page ?? 0;
  const [index, setIndex] = useState(
    Math.min(Math.max(0, startPage), LEADERBOARD_INFO_PAGES.length - 1),
  );

  const scrollTo = useCallback((i: number) => {
    const next = Math.min(Math.max(0, i), LEADERBOARD_INFO_PAGES.length - 1);
    listRef.current?.scrollToIndex({ index: next, animated: true });
    setIndex(next);
  }, []);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
    if (i >= 0 && i < LEADERBOARD_INFO_PAGES.length) setIndex(i);
  }, [pageWidth]);

  const onHeaderBack = useCallback(() => navigation.goBack(), [navigation]);

  const onPrevious = useCallback(() => {
    if (index === 0) {
      navigation.goBack();
      return;
    }
    scrollTo(index - 1);
  }, [index, navigation, scrollTo]);

  const onNext = useCallback(() => {
    if (index >= LEADERBOARD_INFO_PAGES.length - 1) {
      navigation.goBack();
      return;
    }
    scrollTo(index + 1);
  }, [index, navigation, scrollTo]);

  const renderPage = useCallback(
    ({ item }: { item: (typeof LEADERBOARD_INFO_PAGES)[0] }) => (
      <View style={[styles.page, { width: pageWidth }]}>
        <LeaderboardInfoPageBody kind={item.kind} />
      </View>
    ),
    [pageWidth],
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={LB_COLORS.bg} />
      <LeaderboardDarkHeader
        title="Information"
        pageIndex={index}
        showProgress
        onBack={onHeaderBack}
      />
      <FlatList
        ref={listRef}
        style={styles.list}
        data={LEADERBOARD_INFO_PAGES}
        renderItem={renderPage}
        keyExtractor={p => p.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        getItemLayout={(_, i) => ({ length: pageWidth, offset: pageWidth * i, index: i })}
        bounces={false}
        initialScrollIndex={index}
        onScrollToIndexFailed={({ index: i }) => {
          setTimeout(() => listRef.current?.scrollToIndex({ index: i, animated: false }), 100);
        }}
      />
      <LeaderboardInfoFooter
        pageIndex={index}
        onPrevious={onPrevious}
        onNext={onNext}
        bottomInset={insets.bottom}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: LB_COLORS.bg },
  list: { flex: 1 },
  page: { flex: 1 },
});

export default LeaderboardInfoScreen;
