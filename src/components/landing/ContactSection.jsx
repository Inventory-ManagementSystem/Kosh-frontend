import { useState } from "react";
import toast from "react-hot-toast";
import { FaArrowUp } from "react-icons/fa";

import AuthButton from "../auth/AuthButton";
import { sendContactMessage } from "../../api/contactApi";
import illustration from "../../assets/auth/illustration.svg";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMOJI_REGEX =
  /[\p{Extended_Pictographic}\p{Emoji_Presentation}\p{Regional_Indicator}\u200d\ufe0f\u20e3]/gu;

const SQUARES = [
  "left-[8%] top-[22%] h-4 w-4 opacity-10",
  "left-[18%] top-[48%] h-3 w-3 opacity-10",
  "right-[10%] top-[18%] h-5 w-5 opacity-10",
  "right-[6%] top-[42%] h-3 w-3 opacity-10",
  "left-[3%] top-[70%] h-6 w-6 opacity-5",
  "right-[22%] top-[12%] h-3 w-3 opacity-10",
  "right-[3%] top-[62%] h-5 w-5 opacity-5",
];

const INITIAL_FORM = { email: "", note: "", website: "" };
const INITIAL_ERRORS = { email: "", note: "", general: "" };

function ContactSection() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState(INITIAL_ERRORS);
  const [isLoading, setIsLoading] = useState(false);

  const isFormFilled =
    formData.email.trim() !== "" && formData.note.trim() !== "";

  const handleChange = (e) => {
    const { name, value } = e.target;
    const cleanedValue =
      name === "note" ? value.replace(EMOJI_REGEX, "") : value;
    const hadEmoji = cleanedValue !== value;
    setFormData((prev) => ({ ...prev, [name]: cleanedValue }));
    setErrors((prev) => ({
      ...prev,
      [name]: hadEmoji ? "Emojis are not allowed" : "",
      general: "",
    }));
  };

  const validate = () => {
    const newErrors = { ...INITIAL_ERRORS };
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email";
    }
    if (!formData.note.trim()) {
      newErrors.note = "Note is required";
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.note;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || !validate()) return;
    setIsLoading(true);
    try {
      const data = await sendContactMessage({
        email: formData.email.trim(),
        message: formData.note.trim(),
        website: formData.website,
      });

      toast.success(data.message || "Thanks! We've received your message.");
      setFormData(INITIAL_FORM);
      setErrors(INITIAL_ERRORS);
    } catch (error) {
      console.log("Contact failed", error.message);

      if (error.status === 400 && error.fieldErrors) {
        setErrors({
          email: error.fieldErrors.email?.[0] || "",
          note: error.fieldErrors.message?.[0] || "",
          general:
            error.fieldErrors.email || error.fieldErrors.message
              ? ""
              : error.message,
        });
      } else if (error.status === 429) {
        setErrors({
          ...INITIAL_ERRORS,
          general: "Too many attempts. Please try again later.",
        });
      } else {
        setErrors({ ...INITIAL_ERRORS, general: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="relative scroll-mt-16 overflow-hidden px-5 pb-52 pt-10 sm:px-8 sm:pb-72"
    >
      {SQUARES.map((position, index) => (
        <span
          key={index}
          className={`pointer-events-none absolute hidden rounded-sm bg-(--text-color) sm:block ${position}`}
        />
      ))}

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className="absolute right-5 top-6 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-(--icon-border-color) bg-(--accent-color) text-(--page-background) backdrop-blur-md sm:right-8"
      >
        <FaArrowUp className="h-5 w-5" />
      </button>

      <div className="relative z-10 mx-auto mt-10 max-w-[480px] text-center">
        <h2 className="font-['Google_Sans_Flex'] text-5xl font-bold text-(--accent-color)">
          Exciting ?
        </h2>
        <p className="mt-2 text-xl text-(--text-color)">
          Sign Up and get started for free
        </p>

        <div className="mt-8 w-full rounded-lg shadow-[0_0_80px_4px_color-mix(in_srgb,var(--chat-ai-user-background)_55%,transparent)]">
          <form
            noValidate
            onSubmit={handleSubmit}
            className="w-full rounded-lg border border-(--border-color) bg-(--card-background) p-6 text-left backdrop-blur-sm sm:p-8"
          >
            <h3 className="mb-6 text-center font-['Google_Sans_Flex'] text-2xl font-semibold text-(--accent-color)">
              Contact Us
            </h3>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete="off"
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />

            <div className="mb-5">
              <label
                htmlFor="contact-email"
                className="mb-2 block text-sm font-medium text-(--text-color)"
              >
                Enter Email<span className="text-(--error-color)">*</span>
              </label>
              <input
                id="contact-email"
                type="text"
                name="email"
                maxLength={50}
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`w-full rounded-md border bg-(--input-background) px-4 py-3 text-sm text-(--text-color) outline-none transition placeholder:text-(--secondary-text-color) ${
                  errors.email
                    ? "border-(--error-color) focus:border-(--error-color)"
                    : "border-(--border-color) focus:border-(--accent-color)"
                }`}
              />
              {errors.email && (
                <p className="mt-2 text-xs text-(--error-color)">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label
                htmlFor="contact-note"
                className="mb-2 block text-sm font-medium text-(--text-color)"
              >
                Add Note<span className="text-(--error-color)">*</span>
              </label>
              <textarea
                id="contact-note"
                name="note"
                rows={4}
                maxLength={500}
                value={formData.note}
                onChange={handleChange}
                placeholder="Add your note..."
                className={`w-full resize-none rounded-md border bg-(--input-background) px-4 py-3 text-sm text-(--text-color) outline-none transition placeholder:text-(--secondary-text-color) ${
                  errors.note
                    ? "border-(--error-color) focus:border-(--error-color)"
                    : "border-(--border-color) focus:border-(--accent-color)"
                }`}
              />
              {errors.note && (
                <p className="mt-2 text-xs text-(--error-color)">
                  {errors.note}
                </p>
              )}
            </div>

            {errors.general && (
              <p className="mb-4 text-center text-xs text-(--error-color)">
                {errors.general}
              </p>
            )}

            <AuthButton isFormFilled={isFormFilled}>Send</AuthButton>
          </form>
        </div>
      </div>

      <img
        src={illustration}
        alt=""
        className="pointer-events-none absolute bottom-0 left-1/2 z-0 w-full min-w-[900px] -translate-x-1/2 select-none"
      />
    </section>
  );
}

export default ContactSection;
