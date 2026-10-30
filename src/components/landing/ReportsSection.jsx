import grn from "../../assets/auth/grn.svg";
import Report from "../../assets/auth/Report.svg";
import invoice from "../../assets/auth/Invoice.svg";
import connector from "../../assets/auth/Vector 33.svg";

function ReportsSection() {
  return (
    <section
      id="reports"
      className="relative scroll-mt-16 px-5 py-16 sm:px-8 sm:py-24"
    >
      <div className="mx-auto max-w-4xl text-center">
        <p className="font-['Google_Sans_Flex'] text-sm font-medium text-(--accent-color) sm:text-base">
          Manually checking received stocks?
        </p>
        <h2 className="mt-2 font-['Google_Sans_Flex'] text-3xl font-bold leading-tight text-(--text-color) sm:text-5xl">
          Compare and generate automated{" "}
          <span className="text-(--accent-color)">REPORTS.</span>
        </h2>

        <div className="relative mt-14 sm:mt-20">
          <img
            src={connector}
            alt=""
            className="pointer-events-none absolute left-1/2 top-[2%] z-0 hidden h-[92%] w-[112%] max-w-none -translate-x-1/2 select-none lg:block"
          />

          <div className="relative z-10 flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="bg-(--page-background)">
              <img
                src={invoice}
                alt="Goods received note"
                className="w-full max-w-[340px] z-1 rounded-lg ring-1 ring-(--border-color)"
              />
            </div>
            <div className="bg-(--page-background)">
              <img
                src={grn}
                alt="Goods received note"
                className="w-full max-w-[280px] z-1 rounded-lg ring-1 ring-(--border-color)"
              />
            </div>
          </div>

          <img
            src={Report}
            alt="Automated discrepancy report"
            className="relative z-1 mx-auto mt-10 w-full max-w-[1080px] h-[480px] rounded-lg shadow-[0_0_40px_4px_color-mix(in_srgb,var(--chat-ai-user-background)_55%,transparent)] ring-1 ring-(--border-color) lg:mt-24 lg:w-[60%]"
          />
        </div>
      </div>
    </section>
  );
}

export default ReportsSection;
