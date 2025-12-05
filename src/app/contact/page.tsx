export default function ContactPage() {
  return (
    <div className="space-y-4 max-w-xl">
      <h1 className="text-2xl font-semibold">Contact Us</h1>
      <p className="text-sm text-gray-700">
        Have questions about sizing, shipping, or styling? Send us a note and we&apos;ll get back to you soon.
      </p>
      <form
        className="space-y-3 bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm border border-white/70"
        aria-label="Contact form"
      >
        <div>
          <label htmlFor="contact-name" className="block text-xs mb-1">
            Your Name
          </label>
          <input
            id="contact-name"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Your Name"
            required
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="block text-xs mb-1">
            Your Email
          </label>
          <input
            id="contact-email"
            type="email"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label htmlFor="contact-message" className="block text-xs mb-1">
            Message
          </label>
          <textarea
            id="contact-message"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="How can we help?"
            rows={4}
            required
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 text-sm"
        >
          Send message
        </button>
      </form>
    </div>
  );
}
