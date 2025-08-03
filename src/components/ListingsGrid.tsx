// // src/components/ListingsGrid.tsx
// import React from 'react';
// import ListingCard from './ListingCard';

// // Use a placeholder service for better-looking, diverse images
// const listings = [
//   { imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914', location: 'London, United Kingdom', rating: 4.98, date: '1-6 Aug', price: 150, isGuestFavorite: true },
//   { imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994', location: 'Paris, France', rating: 4.85, date: '10-15 Aug', price: 200, isGuestFavorite: false },
//   { imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811', location: 'Condo in Setiawangsa', rating: 4.95, date: '20-25 Aug', price: 175, isGuestFavorite: true },
//   { imageUrl: 'https://images.unsplash.com/photo-1598228723793-52759bba239c', location: 'Apartment in Bukit Bintang', rating: 4.92, date: '5-12 Sep', price: 210, isGuestFavorite: true },
//   { imageUrl: 'https://images.unsplash.com/photo-1554995207-c18c203602cb', location: 'Entire villa in Canggu', rating: 5.00, date: '1-7 Oct', price: 350, isGuestFavorite: true },
//   { imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be', location: 'Rome, Italy', rating: 4.88, date: '15-20 Nov', price: 180, isGuestFavorite: false },
//   { imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', location: 'New York, United States', rating: 4.91, date: '2-9 Dec', price: 290, isGuestFavorite: true },
//   { imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750', location: 'Tokyo, Japan', rating: 4.97, date: '10-18 Jan', price: 220, isGuestFavorite: false },
//   { imageUrl: 'https://images.unsplash.com/photo-1494526585095-c41746248156', location: 'Sydney, Australia', rating: 4.93, date: '20-27 Feb', price: 240, isGuestFavorite: true },
//   { imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6', location: 'Santorini, Greece', rating: 5.00, date: '1-8 Mar', price: 450, isGuestFavorite: true },
// ];

// const ListingsGrid = () => {
//   return (
//     <div className="container mx-auto px-6 py-8">
//       {/* Updated grid for better responsiveness and spacing */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
//         {listings.map((listing, index) => (
//           <ListingCard key={index} {...listing} />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ListingsGrid;