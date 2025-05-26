import { BarChart3, Zap, Target, Users, BarChartHorizontal, MessageSquare } from "lucide-react"

export default function Features() {
  const features = [
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Campaign Analytics",
      description: "Real-time insights and performance metrics to optimize your marketing campaigns on the fly.",
      color: "from-blue-500/20 to-blue-600/20 dark:from-blue-500/10 dark:to-blue-600/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Automated Content Creation",
      description: "Generate high-quality marketing content across multiple platforms with a single click.",
      color: "from-amber-500/20 to-amber-600/20 dark:from-amber-500/10 dark:to-amber-600/10",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Audience Targeting",
      description: "Identify and reach your ideal customers with precision using advanced AI algorithms.",
      color: "from-red-500/20 to-red-600/20 dark:from-red-500/10 dark:to-red-600/10",
      iconColor: "text-red-600 dark:text-red-400",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Multi-Channel Management",
      description: "Seamlessly manage all your marketing channels from a single, intuitive dashboard.",
      color: "from-green-500/20 to-green-600/20 dark:from-green-500/10 dark:to-green-600/10",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      icon: <BarChartHorizontal className="w-8 h-8" />,
      title: "Conversion Optimization",
      description: "Automatically test and refine your campaigns to maximize conversion rates and ROI.",
      color: "from-purple-500/20 to-purple-600/20 dark:from-purple-500/10 dark:to-purple-600/10",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Customer Engagement",
      description: "Build meaningful relationships with your audience through personalized interactions.",
      color: "from-indigo-500/20 to-indigo-600/20 dark:from-indigo-500/10 dark:to-indigo-600/10",
      iconColor: "text-indigo-600 dark:text-indigo-400",
    },
  ]

  return (
    <section
      id="features"
      className="w-full py-20 md:py-28 lg:py-32 flex justify-center items-center relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-40 left-[5%] w-72 h-72 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 right-[5%] w-72 h-72 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 flex flex-col items-center relative z-10">
        <div className="w-full max-w-[800px] mx-auto flex flex-col items-center mb-16">
          <div className="inline-block rounded-lg bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-1 text-sm text-center mx-auto mb-4 shadow-sm transform transition-all duration-300 hover:scale-105">
            <span className="font-medium uppercase tracking-wider text-center">POWERFUL CAPABILITIES</span>
          </div>

          <h2 className="font-inter font-semibold tracking-tight text-3xl sm:text-4xl text-center mx-auto mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
            Features made for you
          </h2>

          <p className="text-muted-foreground font-medium md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-center mx-auto max-w-[600px]">
            Elevate your marketing strategy with AI-powered tools that automate, optimize, and deliver results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-[1000px] mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-8 space-y-4 bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 mx-auto w-full group"
            >
              <div
                className={`p-3 bg-gradient-to-br ${feature.color} rounded-lg mx-auto transition-transform duration-300 group-hover:scale-110 shadow-sm`}
              >
                <div className={`${feature.iconColor} transition-transform duration-300 group-hover:scale-110`}>
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center mx-auto group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-muted-foreground font-medium text-center mx-auto">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
