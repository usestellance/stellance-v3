"use client";

import React, { useState } from "react";

import { Card, CardContent, CardFooter } from "@repo/ui/card";
import { useGetNotifications, useUpdateNotification } from "@/features/notifications/hooks";
import { NotificationItem } from "@/features/notifications/types";
import NotificationPagination from "@/features/notifications/components/NotificationPagination";

// --------------------------
// Notification Card
// --------------------------
const NotificationCard = ({ n }: { n: NotificationItem }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { mutate: updateNotification, isPending } = useUpdateNotification();

  const MAX_LENGTH = 120;
  const shouldTruncate = n?.body.length > MAX_LENGTH;

  const viewed = n?.viewed;

  const message = isExpanded
    ? n?.body
    : shouldTruncate
      ? n?.body.substring(0, MAX_LENGTH) + "..."
      : n?.body;

  const handleView = () => {
    if (!viewed) {
      updateNotification(n?.id);
    }
  };

  return (
    <Card
      className={`p-4 rounded-[5px] transition-colors md:p-6 ${
        viewed ? "bg-white border border-primary-20" : "bg-primary-20"
      }`}
    >
      <CardContent className="text-sm sm:text-base lg:text-lg p-0">
        <div className="flex items-start gap-2 mb-2">
          <p className="flex-1">{message}</p>
        </div>

        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary-500 text-xs sm:text-sm font-medium hover:text-primary-400 transition duration-150 cursor-pointer"
          >
            {isExpanded ? "Read Less" : "Read More"}
          </button>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center text-xs sm:text-base p-0 mt-4">
        <span className="text-neutral-900 sm:text-sm">
          {/* {getTimeAgo(notification.timestamp)} */}
        </span>

        {/* {notification.actionUrl && ( */}
        <button
          onClick={handleView}
          disabled={viewed || isPending}
          className={` bg-primary-20 hover:bg-primary-400 duration-150 cursor-pointer px-3 py-1 rounded-[3px] text-primary-500 font-medium transition hover:text-white  ${
            viewed ? "bg-white" : "border border-primary-50"
          } `}
        >
          {viewed ? "Viewed" : "View"}
        </button>
        {/* )} */}
      </CardFooter>
    </Card>
  );
};

// --------------------------
// Notification List
// --------------------------
const NotificationList = () => {
  const { data, isLoading } = useGetNotifications();
  const notifications = data?.notifications;
  // console.log(notifications);

  return (
    <div className="max-w-[1000px] mx-auto">
      {/* Notification Cards */}
      <div className="space-y-3 md:space-y-6">
        {notifications?.map((notification: NotificationItem, i: number) => (
          <NotificationCard
            key={notification?.id || i}
            n={notification}
            // onMarkAsRead={handleMarkAsRead}
          />
        ))}
      </div>

      {/* Empty State */}
      {!notifications && (
        <div className="text-center py-12 mt-20">
          <p className="text-lg md:text-2xl">No notifications yet</p>
          <p className="text-sm mt-2 md:text-base text-neutral-900">
            We&apos;ll notify you when something important happens
          </p>
        </div>
      )}

      {notifications &&
        data?.meta?.total_pages &&
        data?.meta?.total_pages > 1 && (
          <div className="mt-12">
            <NotificationPagination pageNumber={data?.meta?.total_pages || 1} />
          </div>
        )}

      {isLoading && (
        <div className="text-center py-12 mt-40">
          <p className="text-lg italic animate-pulse">
            Loading notifications...
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationList;
