const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Movie = require('./models/Movie');
const Showtime = require('./models/Showtime');
const Booking = require('./models/Booking');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies';

const generate80Seats = (preBookedSeats = [], bookedUserId = null) => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seats = [];

  for (const row of rows) {
    for (let col = 1; col <= 10; col++) {
      const seatNumber = `${row}${col}`;
      const isBooked = preBookedSeats.includes(seatNumber);
      seats.push({
        seatNumber,
        isBooked,
        bookedBy: isBooked ? bookedUserId : null
      });
    }
  }

  return seats;
};

const seedData = async () => {
  try {
    console.log(`Connecting to database: ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected successfully.');

    // Clear existing collections
    console.log('Cleaning existing data...');
    await Promise.all([
      User.deleteMany({}),
      Movie.deleteMany({}),
      Showtime.deleteMany({}),
      Booking.deleteMany({})
    ]);

    // 1. Seed Users
    console.log('Seeding initial users...');
    const adminUser = await User.create({
      name: 'Admin Cinema',
      email: 'admin@imovies.com',
      password: 'adminpassword123',
      role: 'admin'
    });

    const demoUser = await User.create({
      name: 'Alex Johnson',
      email: 'demo@imovies.com',
      password: 'demopassword123',
      role: 'user'
    });

    console.log('Admin user created: admin@imovies.com / adminpassword123');
    console.log('Demo user created: demo@imovies.com / demopassword123');

    // 2. Seed 6 Trending Movies with realistic posters
    console.log('Seeding 6 trending movies...');
    const moviesData = [
      {
        title: 'Dune: Part Two',
        description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
        genre: ['Sci-Fi', 'Adventure', 'Action'],
        duration: 166,
        releaseDate: new Date('2024-03-01'),
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
        rating: 8.6
      },
      {
        title: 'Oppenheimer',
        description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring the profound moral dilemmas and geopolitical fallout of the Manhattan Project.',
        genre: ['Biography', 'Drama', 'History'],
        duration: 180,
        releaseDate: new Date('2023-07-21'),
        posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
        rating: 8.9
      },
      {
        title: 'Spider-Man: Across the Spider-Verse',
        description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
        genre: ['Animation', 'Action', 'Sci-Fi'],
        duration: 140,
        releaseDate: new Date('2023-06-02'),
        posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=800&q=80',
        rating: 8.7
      },
      {
        title: 'Interstellar',
        description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
        genre: ['Sci-Fi', 'Adventure', 'Drama'],
        duration: 169,
        releaseDate: new Date('2014-11-07'),
        posterUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
        rating: 8.7
      },
      {
        title: 'The Dark Knight',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        genre: ['Action', 'Crime', 'Drama'],
        duration: 152,
        releaseDate: new Date('2008-07-18'),
        posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80',
        rating: 9.0
      },
      {
        title: 'Inception',
        description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.',
        genre: ['Action', 'Sci-Fi', 'Thriller'],
        duration: 148,
        releaseDate: new Date('2010-07-16'),
        posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
        rating: 8.8
      }
    ];

    const createdMovies = await Movie.insertMany(moviesData);
    console.log(`Successfully seeded ${createdMovies.length} movies.`);

    // 3. Seed Showtimes for each movie with 80-seat grid
    console.log('Seeding showtimes and 80-seat grids...');
    const theaters = [
      { name: 'IMAX Laser Cinema - Hall 1', price: 18.00 },
      { name: 'Dolby Atmos Grand Cineplex - Audi 2', price: 14.50 },
      { name: 'PVR Premium Lounge - Screen 3', price: 16.00 }
    ];

    const today = new Date();
    const createdShowtimes = [];

    for (let i = 0; i < createdMovies.length; i++) {
      const movie = createdMovies[i];

      // Schedule 3 showtimes per movie
      for (let j = 0; j < theaters.length; j++) {
        const theater = theaters[j];
        const showDate = new Date(today);
        showDate.setDate(today.getDate() + (j % 2)); // today or tomorrow
        showDate.setHours(13 + j * 3, 30, 0, 0); // e.g. 13:30, 16:30, 19:30

        // Pre-book a realistic subset of seats for showcase
        const preBookedSample = [
          `A${(i + j) % 9 + 1}`,
          `C${(i + 2) % 9 + 1}`,
          `D${(j + 3) % 9 + 1}`,
          `E4`,
          `E5`,
          `F6`
        ];

        const seats = generate80Seats(preBookedSample, demoUser._id);

        const showtime = await Showtime.create({
          movieId: movie._id,
          theaterName: theater.name,
          showTime: showDate,
          ticketPrice: theater.price,
          seats
        });

        createdShowtimes.push(showtime);
      }
    }

    console.log(`Successfully seeded ${createdShowtimes.length} showtimes (each with an 80-seat grid).`);

    // 4. Create an initial confirmed booking for the demo user
    console.log('Creating initial sample booking for demo user...');
    const sampleShowtime = createdShowtimes[0];
    const bookedSeats = ['E4', 'E5'];
    const totalAmount = sampleShowtime.ticketPrice * bookedSeats.length;

    await Booking.create({
      userId: demoUser._id,
      showtimeId: sampleShowtime._id,
      seatsBooked: bookedSeats,
      totalAmount,
      bookingDate: new Date(),
      status: 'confirmed'
    });

    console.log('Sample booking created successfully.');
    console.log('==================================================');
    console.log('🎉 Database Seeding Completed Successfully!');
    console.log('==================================================');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
