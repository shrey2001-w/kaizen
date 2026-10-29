import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

/* ----------------------------- Types & helpers ----------------------------- */

type FormState = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

type Status = { type: "success" | "warning" | "error"; text: string } | null;

const INITIAL_FORM: FormState = { name: "", email: "", phone: "", message: "" };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9\s-]{7,15}$/;

const validate = (form: FormState): FieldErrors => {
  const errors: FieldErrors = {};

  if (!form.name.trim()) errors.name = "Please enter your name.";

  if (!form.email.trim()) errors.email = "Please enter your email address.";
  else if (!EMAIL_REGEX.test(form.email.trim()))
    errors.email = "Enter a valid email, like name@example.com.";

  if (!form.phone.trim()) errors.phone = "Please enter your phone number.";
  else if (!PHONE_REGEX.test(form.phone.trim()))
    errors.phone = "Enter a valid phone number (7–15 digits).";

  if (!form.message.trim()) errors.message = "Please tell us how we can help.";
  else if (form.message.trim().length < 10)
    errors.message = "Add a few more details (at least 10 characters).";

  return errors;
};

/* --------------------------------- Icons ---------------------------------- */

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const MailIcon = () => (
  <svg {...iconProps}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

const PhoneIcon = () => (
  <svg {...iconProps}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </svg>
);

const PinIcon = () => (
  <svg {...iconProps}>
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

/* ------------------------------ Contact items ------------------------------ */

const CONTACT_ITEMS = [
  {
    label: "Email",
    value: "bhattshrey21@gmail.com",
    href: "mailto:bhattshrey21@gmail.com",
    icon: <MailIcon />,
  },
  {
    label: "Phone",
    value: "+91 89203 24753", // Assumed +91 country code. Change if incorrect.
    href: "tel:+918920324753",
    icon: <PhoneIcon />,
  },
  {
    label: "Location",
    value: "Noida, Uttar Pradesh",
    href: undefined,
    icon: <PinIcon />,
  },
];

/* ------------------------------- Shared styles ------------------------------ */

const inputBase =
  "w-full rounded-xl border bg-gray-50 px-4 py-3 text-base sm:text-lg font-outfit font-medium text-black " +
  "placeholder:text-gray-400 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-offset-0";

const inputClass = (hasError: boolean) =>
  `${inputBase} ${
    hasError
      ? "border-red-400 focus:ring-red-300"
      : "border-gray-300 focus:border-gray-400 focus:ring-gray-300"
  }`;

const labelClass = "mb-1.5 block text-sm sm:text-base font-outfit font-semibold text-gray-800";

/* -------------------------------- Component -------------------------------- */

const ContactUs = () => {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending timer when the component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const showStatus = (next: Status, duration = 6000) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus(next);
    if (next) {
      timerRef.current = setTimeout(() => setStatus(null), duration);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear only the error of the field being edited
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleQuery = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showStatus(null);
      // Move focus to the first invalid field
      const firstInvalid = Object.keys(validationErrors)[0];
      (e.currentTarget.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
      return;
    }

    setLoading(true);
    showStatus(null);

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          message: form.message.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        showStatus(
          data.emailSent
            ? {
                type: "success",
                text: "Thank you! Your message has been sent. We'll get back to you shortly.",
              }
            : {
                type: "warning",
                text: "Your message was saved, but the confirmation email could not be sent. We'll still be in touch.",
              }
        );
        setForm(INITIAL_FORM);
        setErrors({});
      } else {
        showStatus({
          type: "error",
          text: data.error || "Something went wrong. Please try again.",
        });
      }
    } catch (err: unknown) {
      showStatus({
        type: "error",
        text:
          err instanceof Error
            ? `Couldn't send your message: ${err.message}`
            : "Couldn't send your message. Check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const statusStyles: Record<NonNullable<Status>["type"], string> = {
    success: "border-green-200 bg-green-50 text-green-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    error: "border-red-200 bg-red-50 text-red-800",
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="scroll-mt-[9rem] lg:scroll-mt-[7rem] bg-white text-black px-4 py-10 sm:px-6 lg:px-8 lg:py-16"
    >
      <div className="mx-auto w-full max-w-[1200px]">
        {/* Section header */}
        <div className="mx-auto mb-8 max-w-3xl text-center lg:mb-12">
          <h2
            id="contact-heading"
            className="font-outfit text-2xl font-bold leading-tight text-black sm:text-3xl lg:text-4xl"
          >
            Experience luxury travel with us
          </h2>
          <p className="mx-auto mt-3 max-w-xl font-outfit text-base text-gray-600 sm:text-lg">
            Tell us about your trip and we'll get back to you with a tailored plan.
          </p>
        </div>

        {/* Content: stacked on mobile, side by side from lg */}
        <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-gray-200 shadow-lg lg:grid-cols-5">
          {/* Contact information panel */}
          <aside className="bg-gradient flex flex-col justify-between gap-8 p-6 text-white sm:p-10 lg:col-span-2">
            <div>
              <h3 className="font-outfit text-2xl font-bold sm:text-3xl">Get in touch</h3>
              <p className="mt-2 font-outfit text-base text-white/85 sm:text-lg">
                Prefer to talk directly? Reach us using any of the details below.
              </p>
            </div>

            <ul className="flex flex-col gap-6">
              {CONTACT_ITEMS.map((item) => (
                <li key={item.label} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15">
                    {item.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="font-outfit text-sm font-semibold text-white/80">
                      {item.label}
                    </p>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="break-words font-outfit text-base font-medium text-white underline-offset-4 hover:underline focus:outline-none focus-visible:underline sm:text-lg"
                      >
                        {item.value}
                      </Link>
                    ) : (
                      <p className="break-words font-outfit text-base font-medium text-white sm:text-lg">
                        {item.value}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          {/* Form */}
          <form
            onSubmit={handleQuery}
            noValidate
            className="flex flex-col gap-5 bg-white p-6 sm:p-10 lg:col-span-3"
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className={labelClass}>
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={handleChange}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className={inputClass(!!errors.name)}
                />
                {errors.name && (
                  <p id="name-error" className="mt-1.5 text-sm font-medium text-red-600">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className={labelClass}>
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={handleChange}
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                  className={inputClass(!!errors.phone)}
                />
                {errors.phone && (
                  <p id="phone-error" className="mt-1.5 text-sm font-medium text-red-600">
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={inputClass(!!errors.email)}
              />
              {errors.email && (
                <p id="email-error" className="mt-1.5 text-sm font-medium text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="message" className={labelClass}>
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                placeholder="Where would you like to go, and when?"
                value={form.message}
                onChange={handleChange}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "message-error" : undefined}
                className={`${inputClass(!!errors.message)} resize-y min-h-[120px]`}
              />
              {errors.message && (
                <p id="message-error" className="mt-1.5 text-sm font-medium text-red-600">
                  {errors.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-gradient mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-3.5 font-outfit text-lg font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:self-start sm:text-xl"
            >
              {loading && (
                <svg
                  className="h-5 w-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="opacity-25"
                  />
                  <path
                    d="M4 12a8 8 0 0 1 8-8"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="opacity-75"
                  />
                </svg>
              )}
              {loading ? "Sending…" : "Send message"}
            </button>

            {/* Live region: screen readers announce status changes */}
            <div role="status" aria-live="polite" className="min-h-0">
              {status && (
                <p
                  className={`rounded-xl border px-4 py-3 font-outfit text-sm font-medium sm:text-base ${
                    statusStyles[status.type]
                  }`}
                >
                  {status.text}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;