const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const User = require('./models/User');
const Movie = require('./models/Movie');
const Showtime = require('./models/Showtime');
const Booking = require('./models/Booking');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies';
const TMDB_API_KEY = process.env.TMDB_API_KEY || '32dda86480f4313b014a308f0b17fb13';

// Official TMDB Genre ID to Name Mapping
const TMDB_GENRES = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western'
};

// Generates standard 80 seats (Rows A-H, Cols 1-10) with realistic pre-booked seats
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

// Fetches movies across Indian Cinema (Bollywood/Tollywood/Kollywood) and Hollywood Top-Rated/Popular
const fetchTMDBMovies = async () => {
  console.log(`Fetching rich catalog from TMDB API (Key: ${TMDB_API_KEY.slice(0, 6)}...)...`);

  const endpoints = [
    // 1. Indian Popular & Trending (Bollywood, Tollywood, Kollywood) - Pages 1, 2, 3
    `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_origin_country=IN&sort_by=popularity.desc&page=1`,
    `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_origin_country=IN&sort_by=popularity.desc&page=2`,
    `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_origin_country=IN&sort_by=popularity.desc&page=3`,

    // 2. Hollywood / Global Trending Blockbusters - Pages 1, 2
    `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`,
    `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=2`,

    // 3. Top-Rated All Time Global Cinema - Pages 1, 2
    `https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}&page=1`,
    `https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}&page=2`
  ];

  try {
    const responses = await Promise.allSettled(
      endpoints.map((url) => axios.get(url, { timeout: 10000 }))
    );

    const rawList = [];
    responses.forEach((res, idx) => {
      if (res.status === 'fulfilled' && res.value.data?.results) {
        rawList.push(...res.value.data.results);
      } else {
        console.warn(`Endpoint ${idx + 1} failed or returned empty:`, res.reason?.message);
      }
    });

    console.log(`Fetched ${rawList.length} candidate movie records from TMDB.`);

    // Deduplicate by TMDB ID and clean Title
    const uniqueMap = new Map();
    const titlesSet = new Set();

    for (const m of rawList) {
      if (!m.id) continue;
      const cleanTitle = (m.title || m.original_title || '').trim();
      const normTitle = cleanTitle.toLowerCase();

      if (!cleanTitle || titlesSet.has(normTitle) || uniqueMap.has(m.id)) {
        continue;
      }

      // Ensure poster path exists for high visual quality in UI
      if (!m.poster_path) continue;

      titlesSet.add(normTitle);
      uniqueMap.set(m.id, m);
    }

    const uniqueMovies = Array.from(uniqueMap.values());
    console.log(`Filtered down to ${uniqueMovies.length} unique high-quality movie titles.`);

    // Map into our Mongoose Movie Schema
    const mappedMovies = uniqueMovies.map((m) => {
      // Map genre IDs to names
      const genres = Array.isArray(m.genre_ids)
        ? m.genre_ids
            .map((id) => TMDB_GENRES[id])
            .filter(Boolean)
        : [];

      // Duration: Realistic runtime between 120 and 180 minutes (deterministic by movie ID)
      const duration = 120 + ((m.id % 61) || 28);

      const rating = m.vote_average && m.vote_average > 0
        ? Number(m.vote_average.toFixed(1))
        : 7.8;

      const releaseDate = m.release_date ? new Date(m.release_date) : new Date();

      const posterUrl = `https://image.tmdb.org/t/p/w500${m.poster_path}`;

      const description = m.overview && m.overview.trim().length > 0
        ? m.overview.trim()
        : 'An exhilarating cinematic spectacle captivating audiences worldwide with stellar performances, visionary storytelling, and breathtaking direction.';

      return {
        title: m.title || m.original_title,
        description,
        genre: genres.length > 0 ? genres : ['Action', 'Drama'],
        duration,
        releaseDate,
        posterUrl,
        rating
      };
    });

    return mappedMovies;
  } catch (error) {
    console.error('Error fetching TMDB movies:', error.message);
    throw error;
  }
};

const seedData = async () => {
  try {
    console.log(`Connecting to database: ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected successfully.');

    // 1. Fetch live TMDB movies
    const moviesToSeed = await fetchTMDBMovies();

    if (moviesToSeed.length === 0) {
      throw new Error('No movies could be fetched from TMDB. Check your API key or network connection.');
    }

    // 2. Clear existing collections
    console.log('Cleaning existing data collections (Movie, Showtime, Booking)...');
    await Promise.all([
      Movie.deleteMany({}),
      Showtime.deleteMany({}),
      Booking.deleteMany({})
    ]);

    // 3. Ensure test users exist
    console.log('Verifying default users...');
    let adminUser = await User.findOne({ email: 'admin@imovies.com' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin Cinema',
        email: 'admin@imovies.com',
        password: 'adminpassword123',
        role: 'admin'
      });
      console.log('Admin user created: admin@imovies.com / adminpassword123');
    }

    let demoUser = await User.findOne({ email: 'demo@imovies.com' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Alex Johnson',
        email: 'demo@imovies.com',
        password: 'demopassword123',
        role: 'user'
      });
      console.log('Demo user created: demo@imovies.com / demopassword123');
    }

    // 4. Insert all fetched movies
    console.log(`Inserting ${moviesToSeed.length} movies into MongoDB Atlas...`);
    const createdMovies = await Movie.insertMany(moviesToSeed);
    console.log(`Successfully saved ${createdMovies.length} movies into the catalog!`);

    // 5. Generate Showtimes with 80-Seat Grid for each movie across realistic theater chains
    console.log('Generating showtimes across prominent Indian & Global theater chains...');
    const theaters = [
      { name: 'PVR INOX IMAX - Audi 1', price: 16.50 },
      { name: 'Cinepolis VIP Lounge - Audi 2', price: 14.00 },
      { name: 'Wave Cinemas Dolby Atmos - Audi 3', price: 12.50 },
      { name: 'Miraj Cinemas 4DX - Audi 4', price: 15.00 }
    ];

    const today = new Date();
    const showtimesToInsert = [];

    createdMovies.forEach((movie, mIdx) => {
      // Create 2 showtimes per movie across alternating theaters
      for (let sIdx = 0; sIdx < 2; sIdx++) {
        const theater = theaters[(mIdx + sIdx) % theaters.length];

        const showDate = new Date(today);
        showDate.setDate(today.getDate() + sIdx); // Today and Tomorrow
        showDate.setHours(14 + (sIdx * 4) + ((mIdx % 3) * 1), 30, 0, 0); // e.g. 14:30, 18:30, 19:30

        // Pre-book a small realistic subset of seats for realistic UI preview
        const preBookedSample = [
          `A${(mIdx + 1) % 10 + 1}`,
          `C${(mIdx + 3) % 10 + 1}`,
          `D${(mIdx + 5) % 10 + 1}`,
          `E4`,
          `E5`
        ];

        const seats = generate80Seats(preBookedSample, demoUser._id);

        showtimesToInsert.push({
          movieId: movie._id,
          theaterName: theater.name,
          showTime: showDate,
          ticketPrice: theater.price,
          seats
        });
      }
    });

    console.log(`Inserting ${showtimesToInsert.length} showtimes (with 80 seats each)...`);
    // Insert in batches of 50 to maintain fast network efficiency with Atlas
    const batchSize = 50;
    const createdShowtimes = [];
    for (let i = 0; i < showtimesToInsert.length; i += batchSize) {
      const batch = showtimesToInsert.slice(i, i + batchSize);
      const insertedBatch = await Showtime.insertMany(batch);
      createdShowtimes.push(...insertedBatch);
    }
    console.log(`Successfully generated ${createdShowtimes.length} showtimes with 80-seat grids!`);

    // 6. Create initial sample confirmed booking for demo user
    console.log('Creating initial sample booking for demo user...');
    if (createdShowtimes.length > 0) {
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
    }

    console.log('==================================================');
    console.log(`🎉 Database Seeding Completed Successfully!`);
    console.log(`🎬 Total Movies Seeded: ${createdMovies.length}`);
    console.log(`🎟️ Total Showtimes Generated: ${createdShowtimes.length}`);
    console.log(`💺 Total Seats Configured: ${createdShowtimes.length * 80}`);
    console.log('==================================================');
    process.exit(0);
  } catch (error) {
    console.error('Error during database seed execution:', error);
    process.exit(1);
  }
};

seedData();
