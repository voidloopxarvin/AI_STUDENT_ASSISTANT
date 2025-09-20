import React from "react"
import { Link } from "react-router-dom"
import { ParticleCard } from "./MagicBento"

const FeatureCard = ({ icon: Icon, title, description, link, color }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    indigo: "from-indigo-500 to-indigo-600",
    pink: "from-pink-500 to-pink-600",
    gray: "from-gray-500 to-gray-600",
  }

  // match glow to main accent
  const glowMap = {
    blue: "37,99,235", // blue-600
    green: "22,163,74", // green-600
    purple: "126,34,206", // purple-600
    indigo: "79,70,229", // indigo-600
    pink: "219,39,119", // pink-600
    gray: "75,85,99", // gray-600
  }

  return (
    <Link to={link} className="group">
      <ParticleCard
        className="relative"
        particleCount={12}
        glowColor={glowMap[color] || "132,0,255"}
        enableTilt={true}
        enableMagnetism={true}
        clickEffect={true}
      >
        {/* Card body */}
        <div className="relative bg-gray-900 dark:bg-gray-900/90 backdrop-blur-md p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2 h-full">
          {/* Icon wrapper */}
          <div
            className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]} mb-4 group-hover:scale-110 transition-transform duration-200`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-200 dark:text-gray-100 mb-3 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>

          {/* Description */}
          <p className="text-gray-200 dark:text-gray-300 leading-relaxed">
            {description}
          </p>
        </div>
      </ParticleCard>
    </Link>
  )
}

export default FeatureCard
