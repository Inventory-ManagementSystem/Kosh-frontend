function NavigationButton({
  children,
  onClick,
  type = "button",
  isFormFilled,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`h-9 w-24 cursor-pointer rounded-md text-xs font-bold transition sm:h-10 sm:w-28 ${
        isFormFilled
          ? "bg-[#b4bedd] text-[#000119] hover:bg-[#95a3cf]"
          : "bg-[#2b2c40] text-[#9697a1]"
      }`}
    >
      {children}
    </button>
  );
}

export default NavigationButton;
