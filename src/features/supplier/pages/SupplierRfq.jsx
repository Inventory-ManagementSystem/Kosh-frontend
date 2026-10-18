import { useState } from "react";
import SupplierRfqCard from "../components/SupplierRfqCard";

const dummyRFQs = [
  {
    id: 1,
    number: "RFQ-7568",
    status: "Open",
    category: "Dairy",
    expected_delivery: "15-10-2026",
    item_count: 4,
    total_quantity: 140,
    details: {
      category: "Dairy",
      expected_delivery: "15-10-2026",
      item_count: 4,
      total_quantity: 140,
      items: [
        {
          id: 101,
          product_name: "Amul Dahi",
          quantity: 30,
          sku: "SKU-123",
        },
        {
          id: 102,
          product_name: "Amul Buttermilk",
          quantity: 20,
          sku: "SKU-123",
        },
        {
          id: 103,
          product_name: "Amul Butter",
          quantity: 40,
          sku: "SKU-123",
        },
        {
          id: 104,
          product_name: "Amul Cheese",
          quantity: 50,
          sku: "SKU-123",
        },
      ],
    },
  },
];

function SupplierRfq() {
  const [expandedRFQ, setExpandedRFQ] = useState("");

  const handleToggle = (rfqId) => {
    setExpandedRFQ((current) =>
      current === rfqId ? null : rfqId
    );
  };

  return (
    <div className="min-h-full bg-[var(--bg-color)] px-4 py-5 sm:px-6">
      <div className="mx-auto w-full max-w-7xl">
        <h1 className="font-['Google_Sans_Flex'] mb-3 text-lg font-semibold text-[var(--text-color)] sm:text-xl">
          All RFQ
        </h1>

        <div className="space-y-3">
          {dummyRFQs.map((rfq) => (
            <SupplierRfqCard
              key={rfq.id}
              rfq={rfq}
              details={rfq.details}
              isExpand={expandedRFQ === rfq.id}
              onToggle={() => handleToggle(rfq.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SupplierRfq;
