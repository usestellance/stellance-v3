import React from "react";

// Shimmer animation component for skeleton effect
const Shimmer = ({ className = "" }) => (
  <div
    className={`animate-pulse bg-gray-200 rounded ${className}`}
  ></div>
);

function InvoiceSkeletonLoader() {
  return (
    <div className="pb-20 md:pb-10 overflow-hidden max-w-[800px] mx-auto">
      <section className="bg-primary-20 border border-[#9FB4DD] pt-5 mt-10 rounded-[10px] pb-[29px] sm:pt-10 sm:pb-14">
        <div className="border-b border-[#9FB4DD80] pb-4 flex flex-col items-center lg:pb-7">
          {/* Invoice Number Skeleton */}
          <Shimmer className="h-4 w-32 sm:h-5 sm:w-40 lg:h-8 lg:w-48" />

          {/* Status Badge Skeleton */}
          <div className="mt-4 md:mt-6">
            <Shimmer className="h-6 w-20 rounded-lg" />
          </div>

          {/* Balance Due Skeleton */}
          <div className="text-sm flex flex-col text-center mt-2 leading-[25px] sm:text-lg lg:leading-[150%] lg:text-3xl md:mt-4">
            <Shimmer className="h-4 w-24 mx-auto mb-2 lg:h-6 lg:w-32" />
            <Shimmer className="h-6 w-32 mx-auto lg:h-8 lg:w-40" />
          </div>
        </div>

        <div className="px-4 sm:px-[30px]">
          {/* Invoice Details Title */}
          <div className="mt-3 mb-3.5 md:mt-5 md:mb-4">
            <Shimmer className="h-5 w-32 lg:h-6 lg:w-40" />
          </div>

          <div className="flex gap-10">
            {/* Biller Section */}
            <div className="flex flex-col text-sm sm:text-lg lg:text-2xl font-medium leading-[150%] min-w-0 flex-1 space-y-2">
              <Shimmer className="h-4 w-20 lg:h-5 lg:w-24" />
              <Shimmer className="h-5 w-36 lg:h-6 lg:w-44" />
              <Shimmer className="h-4 w-full max-w-48 lg:h-5 lg:max-w-56" />
              <Shimmer className="h-4 w-28 lg:h-5 lg:w-36" />
              <div className="mt-auto space-y-2">
                <Shimmer className="h-4 w-24 lg:h-5 lg:w-28" />
                <Shimmer className="h-5 w-32 lg:h-6 lg:w-40" />
              </div>
            </div>

            {/* Billed To Section */}
            <div className="flex justify-end min-w-0 flex-1">
              <div className="flex flex-col w-fit min-w-0 space-y-2">
                <Shimmer className="h-4 w-20 lg:h-5 lg:w-24" />
                <Shimmer className="h-5 w-36 lg:h-6 lg:w-44" />
                <Shimmer className="h-4 w-full max-w-48 lg:h-5 lg:max-w-56" />
                <Shimmer className="h-4 w-28 mb-5 sm:mb-[66px] lg:h-5 lg:w-36" />
                <div className="mt-auto space-y-2">
                  <Shimmer className="h-4 w-20 lg:h-5 lg:w-24" />
                  <Shimmer className="h-5 w-32 lg:h-6 lg:w-40" />
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Address Skeleton */}
          <div className="mt-4 md:mt-10">
            <Shimmer className="h-4 w-full max-w-80 lg:h-5 lg:max-w-96" />
          </div>
        </div>

        {/* Invoice Items Table Skeleton */}
        <div className="mt-[35px] lg:mt-[50px]">
          <InvoiceItemsSkeleton />
        </div>

        {/* Note Section Skeleton */}
        <div className="leading-[150%] px-[30px] mt-4 lg:mt-5 space-y-2">
          <Shimmer className="h-4 w-12 lg:h-5 lg:w-16" />
          <Shimmer className="h-4 w-48 lg:h-5 lg:w-56" />
        </div>
      </section>
    </div>
  );
}

function InvoiceItemsSkeleton() {
  return (
    <div className="bg-[#D9E4F8] rounded-[5px] pb-10 lg:pb-[83px]">
      <div className="overflow-x-auto scroll">
        <table className="bg-[#D9E4F8] min-w-full border-collapse border-spacing-y2 overflow-hidden rounded-[5px]">
          <thead className="bg-[#D1E2FF] overflow-hidden">
            <tr>
              <th className="px-4 py-[15px] text-center">
                <Shimmer className="h-4 w-12 mx-auto lg:h-6 lg:w-16" />
              </th>
              <th className="px-4 py-[15px] text-center">
                <Shimmer className="h-4 w-20 mx-auto lg:h-6 lg:w-24" />
              </th>
              <th className="px-4 py-[15px] text-center">
                <Shimmer className="h-4 w-16 mx-auto lg:h-6 lg:w-20" />
              </th>
              <th className="px-4 py-[15px] text-center">
                <Shimmer className="h-4 w-16 mx-auto lg:h-6 lg:w-20" />
              </th>
              <th className="px-4 py-[15px] text-center">
                <Shimmer className="h-4 w-16 mx-auto lg:h-6 lg:w-20" />
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#BFBFBF99]">
            {/* Skeleton rows */}
            {[1, 2, 3].map((i) => (
              <tr key={i} className="bg-[#D9E4F866]">
                <td className="px-4 py-[15px] text-center">
                  <Shimmer className="h-3 w-16 mx-auto lg:h-4 lg:w-20" />
                </td>
                <td className="px-4 py-[15px] text-center">
                  <Shimmer className="h-3 w-32 mx-auto lg:h-4 lg:w-40" />
                </td>
                <td className="px-4 py-[15px] text-center">
                  <Shimmer className="h-3 w-20 mx-auto lg:h-4 lg:w-24" />
                </td>
                <td className="px-4 py-[15px] text-center">
                  <Shimmer className="h-3 w-8 mx-auto lg:h-4 lg:w-12" />
                </td>
                <td className="px-4 py-[15px] text-center">
                  <Shimmer className="h-3 w-20 mx-auto lg:h-4 lg:w-24" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sub Total Section */}
      <div className="border-t border-[#BFBFBF99] w-full">
        <div className="flex justify-end py-[18px] px-4">
          <div className="flex items-center gap-[81px] justify-end">
            <Shimmer className="h-3 w-16 lg:h-4 lg:w-20" />
            <Shimmer className="h-3 w-20 lg:h-4 lg:w-24" />
          </div>
        </div>
      </div>

      {/* Service Fee Section */}
      <div className="flex justify-end">
        <hr className="text-[#BFBFBF99] w-[230px] lg:w-[558px]" />
      </div>
      <div className="flex justify-end py-[18px] px-4">
        <div className="flex items-center gap-[81px] justify-end">
          <Shimmer className="h-3 w-24 lg:h-4 lg:w-28" />
          <Shimmer className="h-3 w-20 lg:h-4 lg:w-24" />
        </div>
      </div>

      {/* Total Section */}
      <div className="mt-2 w-full flex justify-end px-4">
        <div className="w-full max-w-[273px] lg:max-w-[558px] flex h-[43px] overflow-hidden items-center rounded-[6px]">
          <div className="text-sm font-bold leading-[25px] py-3 px-4 w-[74px] text-white bg-gray-400 md:text-lg flex items-center justify-center">
            <Shimmer className="h-4 w-10 bg-gray-500" />
          </div>
          <div className="w-full text-center lg:text-end text-sm font-bold leading-[25px] md:text-lg py-3 px-4 bg-white flex items-center justify-center">
            <Shimmer className="h-4 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceSkeletonLoader;
