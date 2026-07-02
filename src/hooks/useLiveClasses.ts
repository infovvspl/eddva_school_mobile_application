import { useCallback, useEffect, useMemo, useState } from 'react';
import { calendarService } from '../services/calendar.service';
import { studentService } from '../services/student.service';
import { useApi } from './useApi';
import { useDemo } from '../context/DemoContext';
import { normalizeBatchList } from '../utils/courseMappers';
import { fetchActiveLiveClasses } from '../utils/fetchActiveLiveClasses';
import type { LiveClassEvent } from '../utils/liveClassEvents';

export function useLiveClasses() {
  const { version } = useDemo();
  const month = useMemo(
    () => `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    [],
  );

  const {
    data: calendarData,
    loading: calendarLoading,
    refetch: refetchCalendar,
  } = useApi(() => calendarService.getFeed(month), [month, version]);

  const {
    data: myCoursesData,
    loading: coursesLoading,
    refetch: refetchCourses,
  } = useApi(() => studentService.getMyCourses(), [version]);

  const batchIds = useMemo(
    () =>
      normalizeBatchList(myCoursesData)
        .map((c: Record<string, unknown>) => String(c.batchId || c.id || ''))
        .filter(Boolean),
    [myCoursesData],
  );

  const [liveClasses, setLiveClasses] = useState<LiveClassEvent[]>([]);
  const [discovering, setDiscovering] = useState(true);

  const discover = useCallback(async (silent = false) => {
    if (!silent) setDiscovering(true);
    try {
      const items = await fetchActiveLiveClasses({
        calendarFeed: calendarData,
        batchIds,
      });
      setLiveClasses(items);
    } catch {
      if (!silent) setLiveClasses([]);
    } finally {
      if (!silent) setDiscovering(false);
    }
  }, [calendarData, batchIds]);

  useEffect(() => {
    if (calendarLoading || coursesLoading) return;
    discover();
  }, [discover, calendarLoading, coursesLoading]);

  useEffect(() => {
    if (calendarLoading || coursesLoading) return;
    const timer = setInterval(() => discover(true), 45000);
    return () => clearInterval(timer);
  }, [discover, calendarLoading, coursesLoading]);

  const refresh = useCallback(async () => {
    await Promise.all([refetchCalendar(), refetchCourses()]);
    await discover();
  }, [refetchCalendar, refetchCourses, discover]);

  return {
    liveClasses,
    loading: calendarLoading || coursesLoading || discovering,
    refresh,
  };
}
