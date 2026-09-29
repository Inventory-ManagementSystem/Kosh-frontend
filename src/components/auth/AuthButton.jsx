function AuthButton({ children, isFormFilled }) {
  return (
    <button
      type="submit"
      className={`w-full cursor-pointer rounded-md py-3 text-sm font-semibold transition ${
        isFormFilled
          ? "bg-[#b4bedd] text-[#000119] hover:bg-[#95a3cf]"
          : "bg-[#2b2c40] text-[#9697a1]"
      }`}
    >
      {children}
    </button>
  );
}

export default AuthButton;
