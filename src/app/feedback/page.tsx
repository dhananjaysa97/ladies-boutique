'use client';

import { FormEvent, useState } from 'react';

export default function FeedbackPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="space-y-4 max-w-xl">
      <h1 className="text-2xl font-semibold">Feedback</h1>
      <p className="text-sm text-gray-700">
        We love hearing from you. Tell us what you enjoyed and what we can improve.
      </p>
      <div aria-live="polite" aria-atomic="true">
        {sent ? (
          <p className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
            Thank you for your feedback! It really helps us make Leena&apos;s Boutique better.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-3 bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm border border-white/70"
            aria-label="Feedback form"
          >
            <div>
              <label htmlFor="feedback-message" className="block text-xs mb-1">
                Your Feedback
              </label>
              <textarea
                id="feedback-message"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Share your thoughts..."
                rows={4}
                required
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
