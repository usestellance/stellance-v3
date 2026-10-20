export type NotificationItem = {
  id: string;
  body: string;
  title: string;
  viewed: boolean;
};

export type NotificationsItem = {
  notification: NotificationItem;
  unread_count: string;
  read_count: string;
  total_count: boolean;
  //   actionUrl: string | null;
};
