export type AppNotification = {
  id: string;
  icon: string;
  iconColor: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type?: string;
  routeName?: string;
  routeParams?: Record<string, unknown>;
};
