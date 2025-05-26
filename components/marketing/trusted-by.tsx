export default function TrustedBy() {
  const companies = [
    { name: "Company 1", logo: "/placeholder.svg?height=60&width=120&query=tech%20company%20logo%201" },
    { name: "Company 2", logo: "/placeholder.svg?height=60&width=120&query=tech%20company%20logo%202" },
    { name: "Company 3", logo: "/placeholder.svg?height=60&width=120&query=tech%20company%20logo%203" },
    { name: "Company 4", logo: "/placeholder.svg?height=60&width=120&query=tech%20company%20logo%204" },
  ]

  return (
    <section className="w-full py-12 md:py-16 lg:py-20 border-t border-gray-100 dark:border-gray-800 relative overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white dark:from-gray-900 dark:via-transparent dark:to-gray-900 pointer-events-none"></div>

      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 flex flex-col items-center relative z-10">
        <div className="w-full max-w-[800px] mx-auto flex flex-col items-center">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground text-center mx-auto mb-12">
            TRUSTED BY LEADING COMPANIES
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 w-full place-items-center mx-auto">
            {companies.map((company, index) => (
              <div key={index} className="flex items-center justify-center mx-auto group">
                <img
                  src={company.logo || "/placeholder.svg"}
                  alt={company.name}
                  className="h-8 w-auto opacity-50 grayscale transition-all duration-500 group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-110 mx-auto"
                />
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-16 w-full grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                500,000+
              </span>
              <span className="text-sm text-muted-foreground mt-1">Campaigns Optimized</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                15,000+
              </span>
              <span className="text-sm text-muted-foreground mt-1">Businesses Served</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                40%
              </span>
              <span className="text-sm text-muted-foreground mt-1">Average ROI Increase</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
