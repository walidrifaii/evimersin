"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import {
  FormLoading,
  TextInput,
} from "@/features/dashboard/components/lookups/LookupManager";
import { getApiErrorMessage } from "@/store/api/errors";
import {
  useGetAnnouncementsOverviewQuery,
  useSendAnnouncementMutation,
} from "@/store/slices/admin/announcementsApi";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AnnouncementsPanel() {
  const { data, isLoading, error, refetch, isFetching } =
    useGetAnnouncementsOverviewQuery(undefined, {
      pollingInterval: 15000,
    });
  const [sendAnnouncement, sendState] = useSendAnnouncementMutation();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState<unknown>(null);
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!sentMessage) return;
    const timer = window.setTimeout(() => setSentMessage(null), 5000);
    return () => window.clearTimeout(timer);
  }, [sentMessage]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError(null);
    setSentMessage(null);

    try {
      const result = await sendAnnouncement({ title, message }).unwrap();
      setTitle("");
      setMessage("");
      setSentMessage(result.message);
    } catch (err) {
      setActionError(err);
    }
  }

  if (isLoading && !data) return <FormLoading />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[1.75rem] font-bold tracking-tight text-[var(--brand-navy)]">
          Announcements
        </h1>
        <p className="mt-2 max-w-2xl text-[14px] text-[var(--muted)]">
          Send Firebase push notifications to guests who are currently browsing
          the website and have allowed browser notifications.
        </p>
      </div>

      {!data?.firebaseEnabled ? (
        <div className="rounded-[24px] border border-[#fde68a] bg-[#fffbeb] px-5 py-4 text-[13px] text-[#92400e]">
          Firebase is not fully configured. Add your Firebase client and admin
          keys to enable guest push notifications.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-[24px] border border-[#e8eef6] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
            Guests online now
          </p>
          <p className="mt-2 text-[2rem] font-bold text-[var(--brand-navy)]">
            {data?.activeGuestCount ?? 0}
          </p>
          <p className="mt-1 text-[12px] text-[var(--muted)]">
            Active in the last 5 minutes
            {isFetching ? " · refreshing..." : ""}
          </p>
        </div>
        <div className="rounded-[24px] border border-[#e8eef6] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
            Can receive push
          </p>
          <p className="mt-2 text-[2rem] font-bold text-[var(--brand-navy)]">
            {data?.reachableGuestCount ?? 0}
          </p>
          <p className="mt-1 text-[12px] text-[var(--muted)]">
            Online guests with notifications enabled
          </p>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="max-w-3xl rounded-[24px] border border-[#e8eef6] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6"
      >
        <h2 className="text-[15px] font-semibold text-[var(--brand-navy)]">
          Send announcement
        </h2>
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          Sends instantly via Firebase to online guests who enabled notifications.
        </p>

        <div className="mt-4 space-y-4">
          <TextInput
            label="Title"
            value={title}
            required
            placeholder="Special offer today"
            onChange={setTitle}
          />
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[var(--brand-navy)]">
              Message
            </span>
            <textarea
              value={message}
              required
              rows={4}
              placeholder="Write the message guests will see on the website..."
              onChange={(event) => setMessage(event.target.value)}
              className="w-full rounded-xl border border-[#dbe4f0] bg-white px-3.5 py-2.5 text-[14px] text-[var(--brand-navy)] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[var(--brand-blue)]"
            />
          </label>
        </div>

        {error || actionError ? (
          <div className="mt-4 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] font-medium text-[#b91c1c]">
            {getApiErrorMessage(actionError ?? error)}
          </div>
        ) : null}

        {sentMessage ? (
          <div className="mt-4 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-[13px] font-medium text-[#15803d]">
            {sentMessage}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={sendState.isLoading}
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-[var(--brand-red)] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#c9181e] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {sendState.isLoading ? "Sending..." : "Send Firebase push"}
          </button>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-[#dbe4f0] px-5 text-[13px] font-semibold text-[var(--brand-navy)] transition-colors hover:bg-[#f8fafc]"
          >
            Refresh count
          </button>
        </div>
      </form>

      <section className="max-w-3xl rounded-[24px] border border-[#e8eef6] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
        <h2 className="text-[15px] font-semibold text-[var(--brand-navy)]">
          Recent announcements
        </h2>

        {data?.announcements.length ? (
          <ul className="mt-4 space-y-3">
            {data.announcements.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl border border-[#e8eef6] px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[14px] font-semibold text-[var(--brand-navy)]">
                    {item.title}
                  </p>
                  {item.isActive ? (
                    <span className="rounded-full bg-[#ecfdf3] px-2 py-0.5 text-[11px] font-semibold text-[#15803d]">
                      Active
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-[13px] text-[var(--muted)]">
                  {item.message}
                </p>
                <p className="mt-2 text-[11px] text-[#94a3b8]">
                  {formatDate(item.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-[13px] text-[var(--muted)]">
            No announcements sent yet.
          </p>
        )}
      </section>
    </div>
  );
}
