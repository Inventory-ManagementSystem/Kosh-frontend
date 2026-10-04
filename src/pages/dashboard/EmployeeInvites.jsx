import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FiRefreshCw } from "react-icons/fi";
import { FaCircleXmark } from "react-icons/fa6";
import toast from "react-hot-toast";

import logo from "../../assets/auth/logo.svg";
import AuthDecoration from "../../components/auth/AuthDecoration";

import { useAuth } from "../../context/AuthContext";
import { getInvites } from "../../api/getInvitesApi";
import { acceptInvite } from "../../api/acceptInviteApi";
import { declineInvite } from "../../api/declineInviteApi";

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
      <div className="min-h-screen bg-[#00010f] text-[#e6e6e8]">
        <AuthDecoration />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <p className="text-sm text-[#9697a1]">Loading invites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020313] text-white relative overflow-hidden">
      <Link to="/" className="fixed  top-8 left-8 sm:left-15">
        <img src={logo} alt="KOSH" className="h-6 w-auto sm:h-7" />
      </Link>
      <AuthDecoration />
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="fixed left-8 top-20 z-10 text-[#b4bedd] transition hover:text-white sm:left-15"
      >
        <IoMdArrowRoundBack size={25} />
      </button>
      {invites.length === 0 ? (
        <div className="flex min-h-screen flex-col items-center justify-center text-center">
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full ">
            <FaCircleXmark size={58} className="text-[#ff6b6b]" />
          </div>

          <h1 className="text-3xl font-semibold">Sorry, no invites...</h1>

          <p className="mt-3 max-w-[280px] text-sm text-[#9697a1]">
            Ask your Business owner to send you an invite
          </p>

          <button
            type="button"
            onClick={fetchInvites}
            className="mt-10 rounded-md bg-[#b4bedd] px-8 py-3 text-sm font-medium text-[#00010f] transition hover:bg-[#c5cde5]"
          >
            Check Again
          </button>
        </div>
      ) : (
        <div className="mx-auto mt-8 w-full max-w-[465px]">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold tracking-tight">
              Check your invites
            </h1>

            <button
              type="button"
              onClick={fetchInvites}
              disabled={loading}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111426] text-[#b4bedd] transition hover:bg-[#171a2d]"
            >
              <FiRefreshCw size={19} />
            </button>
          </div>

          <div className="mt-8 space-y-4">
            {invites.map((invite) => (
              <button
                key={invite.id}
                type="button"
                onClick={() => setSelectedInvite(invite)}
                className={`flex w-full items-center gap-4 rounded-xl border px-5 py-5 text-left transition ${
                  selectedInvite?.id === invite.id
                    ? "border-[#b4bedd] bg-[#111426]"
                    : "border-[#2b2c40] bg-[#111426] hover:border-[#55586e]"
                }`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                    selectedInvite?.id === invite.id
                      ? "border-[#b4bedd]"
                      : "border-[#9697a1]"
                  }`}
                >
                  {selectedInvite?.id === invite.id && (
                    <span className="h-2 w-2 rounded-full bg-[#b4bedd]" />
                  )}
                </span>

                <span className="text-sm font-medium">
                  {invite.business_name}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between gap-5">
            <button
              type="button"
              onClick={handleDecline}
              disabled={actionLoading || !selectedInvite}
              className="w-full rounded-md border border-[#b4bedd] py-3 text-sm text-[#e6e6e8] transition hover:bg-[#111426] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Ignore
            </button>

            <button
              type="button"
              onClick={handleAccept}
              disabled={actionLoading || !selectedInvite}
              className="w-full rounded-md bg-[#b4bedd] py-3 text-sm font-medium text-[#00010f] transition hover:bg-[#c5cde5] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Accept
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeInvites;
