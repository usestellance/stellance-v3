"use client";

import Notifications from "@/features/notifications/components/Notifications";
import { useGetNotifications } from "@/features/notifications/hooks";

export default function Page() {
  // const { data } = useGetNotifications();
  return (
    <div className="pt-5 pb-20">
      <div className="custom-container">
        <div className="flex justify-between">
          <h2 className="h2-app">Notifications</h2>
    
        </div>
        <section className="mt-5 sm:mt-10">
          <Notifications />
        </section>
      </div>
    </div>
  );
}
