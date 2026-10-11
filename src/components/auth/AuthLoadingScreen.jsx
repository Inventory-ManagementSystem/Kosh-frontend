import logo from "../../assets/auth/logo.svg";

function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-(--page-background) text-(--text-color)">
      <div className="flex flex-col items-center gap-5">
        <img src={logo} alt="KOSH" className="w-32" />
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-(--border-color) border-t-(--accent-color)" />
        <p className="text-sm text-(--secondary-text-color)">
          Restoring your session...
        </p>
      </div>
    </div>
  );
}

export default AuthLoadingScreen;
