// // src/components/ListingCard.tsx
// import Image from 'next/image';
// import React from 'react';
// import { Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';

// interface ListingCardProps {
//   imageUrl: string;
//   location: string;
//   rating: number;
//   date: string;
//   price: number;
//   isGuestFavorite: boolean;
// }

// const ListingCard: React.FC<ListingCardProps> = ({ imageUrl, location, rating, date, price, isGuestFavorite }) => {
//   return (
//     <div className="group cursor-pointer">
//       <div className="relative w-full aspect-square mb-2 overflow-hidden rounded-xl">
//         {/* Wishlist Heart Icon */}
//         <button className="absolute top-3 right-3 z-10 p-1 rounded-full bg-black/20 hover:bg-black/50 transition">
//           <Heart size={24} className="text-white" fill="rgba(0,0,0,0.5)" strokeWidth={1}/>
//         </button>

//         {/* Guest Favorite Badge */}
//         {isGuestFavorite && (
//           <div className="absolute top-3 left-3 z-10 bg-white text-gray-900 text-xs font-bold py-1 px-2 rounded-md shadow-md">
//             Guest favorite
//           </div>
//         )}
        
//         <Image
//           src={imageUrl}
//           alt={location}
//           layout="fill"
//           objectFit="cover"
//           className="transition-transform duration-300 group-hover:scale-105"
//         />

//         {/* Carousel Buttons - Visible on Hover */}
//         <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//             <button className="bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md">
//                 <ChevronLeft size={18} />
//             </button>
//             <button className="bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md">
//                 <ChevronRight size={18} />
//             </button>
//         </div>
//       </div>

//       <div className="flex justify-between items-start mt-2">
//         <h3 className="font-medium text-[15px]">{location}</h3>
//         <div className="flex items-center space-x-1 flex-shrink-0">
//           <Star size={14} fill="black" strokeWidth={0}/>
//           <span className="text-sm">{rating.toFixed(2)}</span>
//         </div>
//       </div>
      
//       <p className="text-gray-500 text-[15px]">1-6 Aug</p>
//       <p className="mt-1">
//         <span className="font-semibold">£{price}</span>
//         <span className="text-gray-800"> night</span>
//       </p>
//     </div>
//   );
// };

// export default ListingCard;