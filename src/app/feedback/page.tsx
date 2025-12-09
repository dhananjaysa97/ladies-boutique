'use client';

import { FormEvent, useState } from 'react';

export default function FeedbackPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="space-y-4 max-w-xl">
      <h1 className="text-2xl font-semibold">Feedback</h1>
      <p className="text-sm text-gray-700">
        We would love to hear your thoughts about Leena&apos;s Boutique.
      </p>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        {sent ? (
          <p className="text-sm text-green-700">
            Thank you! Your feedback has been submitted.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="text-xs font-medium text-gray-700">
                Name (optional)
              </label>
              <input
                id="name"
                name="name"
                className="rounded border px-2 py-1 text-sm"
                placeholder="Your name"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-xs font-medium text-gray-700">
                Email (optional)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="rounded border px-2 py-1 text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="message"
                className="text-xs font-medium text-gray-700"
              >
                Your feedback
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                className="rounded border px-2 py-1 text-sm"
                placeholder="What did you love? What can we improve?"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 text-sm"
            >
              Submit feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
