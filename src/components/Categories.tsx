// // src/components/Categories.tsx
// import React from 'react';
// import { Waves, Home, Wind, TreePine, Sun, Building, Castle, Ship } from 'lucide-react';

// const categories = [
//   { name: 'Amazing pools', icon: <Waves /> },
//   { name: 'Farms', icon: <Home /> },
//   { name: 'Beachfront', icon: <Sun /> },
//   { name: 'Tiny homes', icon: <Home /> },
//   { name: 'Windmills', icon: <Wind /> },
//   { name: 'National parks', icon: <TreePine /> },
//   { name: 'Mansions', icon: <Building /> },
//   { name: 'Castles', icon: <Castle /> },
//   { name: 'Houseboats', icon: <Ship /> },
//   // Add more to enable scrolling
//   { name: 'Amazing pools', icon: <Waves /> },
//   { name: 'Farms', icon: <Home /> },
//   { name: 'Beachfront', icon: <Sun /> },
//   { name: 'Tiny homes', icon: <Home /> },
// ];

// const Categories = () => {
//   return (
//     // The top value should match the header's height
//     <section className="sticky top-[81px] z-40 bg-white/95 backdrop-blur-sm shadow-sm">
//       <div className="container mx-auto px-6 py-1">
//         {/* We use a container that hides the scrollbar for a cleaner look */}
//         <div className="overflow-x-auto whitespace-nowrap no-scrollbar">
//           <div className="inline-flex justify-center items-center space-x-8 py-3">
//             {categories.map((category, index) => (
//               <div key={index} className="flex flex-col items-center justify-center space-y-2 text-gray-500 hover:text-black hover:border-b-2 border-gray-300 hover:border-black pb-2 cursor-pointer transition-all duration-150 group">
//                 {React.cloneElement(category.icon, { size: 24, className: "group-hover:text-black" })}
//                 <span className="text-xs font-medium">{category.name}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Categories;