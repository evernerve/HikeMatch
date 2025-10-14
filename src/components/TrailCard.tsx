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
        
        <p className="text-sm mb-4 line-clamp-3 text-gray-200">
          {trail.description}
        </p>

        {/* Trail Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-black/40 rounded-lg p-3">
            <div className="text-xs text-gray-200 mb-1">Distance</div>
            <div className="text-lg font-semibold">{trail.lengthKm} km</div>
          </div>
          <div className="bg-black/40 rounded-lg p-3">
            <div className="text-xs text-gray-200 mb-1">Duration</div>
            <div className="text-lg font-semibold">{trail.durationHours} hrs</div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-green-600 rounded-full text-xs font-medium">
            {trail.pathType}
          </span>
          <span className="px-3 py-1 bg-blue-600 rounded-full text-xs font-medium">
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
