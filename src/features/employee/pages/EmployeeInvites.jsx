import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FiRefreshCw } from "react-icons/fi";
import { FaCircleXmark } from "react-icons/fa6";
import toast from "react-hot-toast";

import logo from "../../../assets/auth/logo.svg";
import AuthDecoration from "../../../components/auth/AuthDecoration";
import { useAuth } from "../../../context/AuthContext";

import { getInvites } from "../api/getInvitesApi";
import { acceptInvite } from "../api/acceptInviteApi";
import { declineInvite } from "../api/declineInviteApi";

function EmployeeInvites() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [invites, setInvites] = useState([]);
  const [selectedInvite, setSelectedInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchInvites = async () => {
    try {
      setLoading(true);
      const data = await getInvites(accessToken);
      setInvites(data.data?.invites || []);
      setSelectedInvite(null);
    } catch (error) {
      toast.error(error.message || "Failed to fetch invites.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const handleAccept = async () => {
    if (!selectedInvite) {
      toast.error("Please select an invite.");
      return;
    }

    try {
      setActionLoading(true);
      const data = await acceptInvite(selectedInvite.id, accessToken);
      toast.success(data.message || "Invite accepted.");
      localStorage.removeItem("selectedRole");
      navigate("/complete-setup", { state: { employee: true } });
    } catch (error) {
      toast.error(error.message || "Failed to accept invite.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!selectedInvite) {
      toast.error("Please select an invite.");
      return;
    }

    try {
      setActionLoading(true);
      const data = await declineInvite(selectedInvite.id, accessToken);
      toast.success(data.message || "Invite declined.");
      await fetchInvites();
    } catch (error) {
      toast.error(error.message || "Failed to decline invite.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-x-hidden bg-(--background-color) text-(--text-color)">
        <AuthDecoration />

        <Link
          to="/"
          className="fixed left-4 top-5 z-20 sm:left-8 sm:top-7 lg:left-15"
        >
          <img src={logo} alt="KOSH" className="h-6 w-auto sm:h-7" />
        </Link>

        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-24">
          <p className="text-sm text-(--secondary-text-color)">
            Loading invites...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-(--background-color) text-(--text-color)">
      <Link
        to="/"
        className="fixed left-4 top-5 z-20 sm:left-8 sm:top-7 lg:left-15"
      >
        <img src={logo} alt="KOSH" className="h-6 w-auto sm:h-7" />
      </Link>

      <AuthDecoration />

      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Go back"
        className="fixed left-4 top-[4.25rem] z-20 text-(--secondary-text-color) transition hover:text-(--text-color) sm:left-8 sm:top-[4.75rem] lg:left-15"
      >
        <IoMdArrowRoundBack size={25} />
      </button>

      {invites.length === 0 ? (
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pb-10 pt-28 text-center sm:pt-32">
          <div className="mb-6 flex h-16 w-16 items-center justify-center sm:mb-8 sm:h-20 sm:w-20">
            <FaCircleXmark
              size={58}
              className="max-h-full max-w-full text-(--error-color)"
            />
          </div>

          <h1 className="text-2xl font-semibold sm:text-3xl">
            Sorry, no invites...
          </h1>

          <p className="mt-3 max-w-[280px] text-sm text-(--secondary-text-color)">
            Ask your Business owner to send you an invite
          </p>

          <button
            type="button"
            onClick={fetchInvites}
            disabled={loading || actionLoading}
            className="mt-8 rounded-md bg-(--accent-color) px-8 py-3 text-sm font-medium text-(--page-background) transition hover:opacity-90 disabled:opacity-50 sm:mt-10"
          >
            Check Again
          </button>
        </div>
      ) : (
        <main className="relative z-10 mx-auto w-full max-w-[465px] px-4 pb-8 pt-32 sm:px-6 sm:pt-36 md:pt-40">
          <div className="flex items-center justify-between gap-3">
            <h1 className="min-w-0 text-2xl font-semibold tracking-tight sm:text-3xl">
              Check your invites
            </h1>

            <button
              type="button"
              onClick={fetchInvites}
              disabled={loading || actionLoading}
              aria-label="Refresh invites"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--card-background) text-(--secondary-text-color) transition hover:bg-(--sidebar-hover-background) disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiRefreshCw size={19} />
            </button>
          </div>

          <div className="mt-6 space-y-3 sm:mt-8 sm:space-y-4">
            {invites.map((invite) => (
              <button
                key={invite.id}
                type="button"
                onClick={() => setSelectedInvite(invite)}
                disabled={actionLoading}
                aria-pressed={selectedInvite?.id === invite.id}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-4 text-left transition sm:gap-4 sm:px-5 sm:py-5 ${
                  selectedInvite?.id === invite.id
                    ? "border-(--accent-color) bg-(--card-background)"
                    : "border-(--border-color) bg-(--card-background) hover:border-(--accent-color)"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    selectedInvite?.id === invite.id
                      ? "border-(--accent-color)"
                      : "border-(--secondary-text-color)"
                  }`}
                >
                  {selectedInvite?.id === invite.id && (
                    <span className="h-2 w-2 rounded-full bg-(--accent-color)" />
                  )}
                </span>

                <span className="min-w-0 flex-1 break-words text-sm font-medium sm:text-base">
                  {invite.business_name}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4">
            <button
              type="button"
              onClick={handleDecline}
              disabled={actionLoading || !selectedInvite}
              className="w-full rounded-md border border-(--border-color) px-4 py-3 text-sm text-(--text-color) transition hover:bg-(--sidebar-hover-background) disabled:cursor-not-allowed disabled:opacity-40"
            >
              {actionLoading ? "Please wait..." : "Ignore"}
            </button>

            <button
              type="button"
              onClick={handleAccept}
              disabled={actionLoading || !selectedInvite}
              className="w-full rounded-md bg-(--accent-color) px-4 py-3 text-sm font-medium text-(--page-background) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {actionLoading ? "Please wait..." : "Accept"}
            </button>
          </div>
        </main>
      )}
    </div>
  );
}

export default EmployeeInvites;
