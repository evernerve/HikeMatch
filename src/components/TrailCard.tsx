import { Trail } from '../lib/firestoreHelpers';

interface TrailCardProps {
  trail: Trail;
}

export default function TrailCard({ trail }: TrailCardProps) {
  return (
    <div className="relative w-full h-[600px] rounded-2xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing">
      {/* Trail Image */}
      <img
        src={trail.image}
        alt={trail.name}
        className="w-full h-full object-cover"
        loading="lazy"
        decoding="async"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Trail Info */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h2 className="text-3xl font-bold mb-3">{trail.name}</h2>
        
        <p className="text-sm mb-4 line-clamp-2 text-gray-200">
          {trail.description}
        </p>

        {/* Trail Stats - Icon Only Grid */}
        <div className="flex flex-wrap gap-2 mb-3">
          {/* Distance */}
          <div className="bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
            <span className="text-base">🚶‍♂️</span>
            <span className="text-xs font-medium text-gray-800">{trail.lengthKm} km</span>
          </div>
          
          {/* Duration */}
          <div className="bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
            <span className="text-base">⏱️</span>
            <span className="text-xs font-medium text-gray-800">{trail.durationHours} hrs</span>
          </div>
          
          {/* Elevation */}
          <div className="bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
            <span className="text-base">⛰️</span>
            <span className="text-xs font-medium text-gray-800">{trail.elevationGainM} m</span>
          </div>
          
          {/* Difficulty */}
          <div className="bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
            <span className="text-base">{trail.difficulty === 'easy' ? '🟢' : trail.difficulty === 'moderate' ? '🟡' : '🔴'}</span>
            <span className="text-xs font-medium text-gray-800 capitalize">{trail.difficulty}</span>
          </div>
        </div>

        {/* Location & Transport - Icon Only */}
        <div className="flex flex-wrap gap-2 mb-3">
          {/* Location */}
          <div className="bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
            <span className="text-base">📍</span>
            <span className="text-xs font-medium text-gray-800">{trail.location}</span>
          </div>
          
          {/* Transport Time */}
          <div className="bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
            <span className="text-base">🚂</span>
            <span className="text-xs font-medium text-gray-800">{trail.publicTransportTime} min</span>
          </div>
        </div>

        {/* Trail Type Tags */}
        <div className="flex flex-wrap gap-2">
          <span className="px-2.5 py-1 bg-green-500/60 backdrop-blur-sm rounded-full text-xs font-medium text-white shadow-sm">
            {trail.pathType}
          </span>
          <span className="px-2.5 py-1 bg-blue-500/60 backdrop-blur-sm rounded-full text-xs font-medium text-white shadow-sm">
            {trail.scenery}
          </span>
        </div>
      </div>

      {/* Swipe Hint (optional decorative element) */}
      <div className="absolute top-6 right-6 bg-white/90 rounded-full p-3 shadow-lg">
        <span className="text-2xl">👆</span>
      </div>
    </div>
  );
}
