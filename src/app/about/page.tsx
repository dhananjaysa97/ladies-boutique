export default function AboutPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">About Leena&apos;s Boutique</h1>
      <p className="text-sm text-gray-700">
        Leena&apos;s Boutique is a curated online destination for modern, comfortable, and elegant womenswear.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm border border-white/70">
          <h2 className="font-semibold mb-2 text-pink-700 text-sm">Our Philosophy</h2>
          <p className="text-sm text-gray-700">
            We handpick pieces that blend effortless style with everyday wearability, so you always feel confident and comfortable.
          </p>
        </div>
        <div className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm border border-white/70">
          <h2 className="font-semibold mb-2 text-pink-700 text-sm">For Every Occasion</h2>
          <p className="text-sm text-gray-700">
            From brunch dates to festive celebrations, our collections are designed to move with you through every moment.
          </p>
        </div>
      </div>
    </div>
  );
}
