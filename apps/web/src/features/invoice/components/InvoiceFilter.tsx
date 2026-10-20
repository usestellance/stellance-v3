"use client";

import dynamic from "next/dynamic";

// Create a loading placeholder that matches your component's layout
const LoadingPlaceholder = () => <div></div>;

// Dynamically import the actual component with no SSR
const InvoiceFilterContent = dynamic(() => import("@/features/invoice/components/InvoiceFilterContent"), {
  ssr: false,
  loading: () => <LoadingPlaceholder />,
});

const InvoiceFilter = () => {
  return <InvoiceFilterContent />;
};

export default InvoiceFilter;
