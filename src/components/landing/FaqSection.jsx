import { useState } from "react";

import FaqItem from "./FaqItem";
import SectionBadge from "./SectionBadge";

const Highlight = ({ children }) => (
  <span className="font-['Google_Sans_Flex'] font-semibold text-(--chat-ai-user-background) brightness-150">
    {children}
  </span>
);

const FAQS = [
  {
    question: "What is Kosh?",
    answer: (
      <>
        Kosh is a <Highlight>B2B </Highlight>automated invoice generation and
        inventory monitoring system, that helps businesses manage their stock
        and purchasing in one place.
      </>
    ),
  },
  {
    question: "Who can use Kosh?",
    answer: (
      <>
        Any business that buys goods and keeps them in stock -- be it retailers,
        distributors or wholesalers. Owner added employees can use Kosh for
        creating Goods Receipt Notes and recording dispatches. Furthermore,
        suppliers can use it too, for receiving orders and sending quotations.
      </>
    ),
  },
  {
    question: "How will I know when I am running out of stock?",
    answer:
      "Kosh watches your stock levels and alerts you when a product is running low, making sure you are never depleted of any product.",
  },
  {
    question: "Do I need to create invoices myself?",
    answer: (
      <>
        No, whenever an order is dispatched, invoice is generated automatically.
        No manual paperwork required!
      </>
    ),
  },
  {
    question: "What if the delivery doesn't match what i ordered?",
    answer:
      "When goods arrive, you record what you actually received. Kosh compares it with your order and flags any shortages or damages, ensuring you only pay for what you got.",
  },
  {
    question: "Is my business data private?",
    answer: (
      <>
        "Yes, each business sees it own data, and there is role-based access for
        employees, owners and suppliers."
      </>
    ),
  },
];

function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);
  const handleToggle = (index) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section
      id="faq"
      className="relative scroll-mt-16 px-5 py-16 sm:px-8 sm:py-24"
    >
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <SectionBadge>FAQ</SectionBadge>
          <h2 className="font-['Google_Sans_Flex'] text-3xl font-bold leading-tight text-(--text-color) sm:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 font-['Google_Sans_Flex'] text-sm font-medium text-(--accent-color) sm:text-lg">
            Everything you need to know about KOSH
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:mt-12">
          {FAQS.map((faq, index) => (
            <FaqItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FaqSection;
