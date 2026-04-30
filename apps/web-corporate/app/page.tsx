export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            AI-Powered Delivery
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            South Africa&apos;s intelligent last-mile logistics platform connecting restaurants, drivers, and customers through autonomous AI dispatch.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="#contact" className="px-8 py-3 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition">
              Get Started
            </a>
            <a href="#solutions" className="px-8 py-3 border-2 border-gray-200 rounded-full font-medium hover:border-emerald-600 transition">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-emerald-900 text-white">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold">50K+</div>
            <div className="text-emerald-200">Daily Orders</div>
          </div>
          <div>
            <div className="text-4xl font-bold">3.5K+</div>
            <div className="text-emerald-200">Driver Partners</div>
          </div>
          <div>
            <div className="text-4xl font-bold">2.5K+</div>
            <div className="text-emerald-200">Restaurant Partners</div>
          </div>
          <div>
            <div className="text-4xl font-bold">98.7%</div>
            <div className="text-emerald-200">On-Time Delivery</div>
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section id="solutions" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Platform Solutions</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-xl">
              <h3 className="text-xl font-semibold mb-3">For Restaurants</h3>
              <p className="text-gray-600">Smart menu management, real-time orders, and analytics dashboard.</p>
            </div>
            <div className="p-6 border rounded-xl">
              <h3 className="text-xl font-semibold mb-3">For Drivers</h3>
              <p className="text-gray-600">AI-optimized routes, instant payouts, and performance tracking.</p>
            </div>
            <div className="p-6 border rounded-xl">
              <h3 className="text-xl font-semibold mb-3">For Customers</h3>
              <p className="text-gray-600">Track orders in real-time, earn rewards, and discover new restaurants.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}