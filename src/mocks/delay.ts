import { MOCK_DELAY_MS } from '../config/appConfig';

export const mockDelay = () =>
  new Promise<void>(r => setTimeout(r, MOCK_DELAY_MS));
