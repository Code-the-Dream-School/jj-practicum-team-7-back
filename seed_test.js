/* 
  Safe test seeder: adds demo data into the DB pointed by MONGO_URI_TEST (from .env).
  Does NOT delete existing data. Use a separate DB like peerquests_test.
*/

require('dotenv').config();
const mongoose = require('mongoose');

// adjust paths if your models live elsewhere
const User = require('./src/models/User');
const { Challenge, categories } = require('./src/models/Challenge');
const CheckIn = require('./src/models/CheckIn');

const msPerDay = 24 * 60 * 60 * 1000;
const now = Date.now();

const TITLE_BANK = {
  Fitness: [
    'Morning Run Club',
    '10 Push-ups Daily',
    'Sunrise Yoga Flow',
    'Daily Stretch Reset',
    'Evening Walk Habit',
  ],
  Learning: [
    'Read 20 Pages',
    '30-min Coding Session',
    'TED Talk a Day',
    'Learn a New Word',
    'Journal Your Insights',
    'Listen to a Podcast',
  ],
  Productivity: [
    'Plan Tomorrow Today',
    'Daily Priority 3',
    'Pomodoro Sprints',
    'Clear Your Desk',
    'Weekly Review',
    'Shut Down Ritual',
  ],
  Health: [
    'No Sugar Week',
    'Hydrate 2L',
    'Sleep by 11',
    'Veggie with Every Meal',
    'Step Count Goal',
    'Mindful Eating',
  ],
  Creativity: [
    'Daily Sketchbook',
    'Write a Haiku',
    'Take a Creative Photo',
    'Try a New Recipe',
    'Music Discovery',
    'One Page Story',
  ],
  SelfCare: [
    '10-min Meditation',
    'Gratitude Journal',
    'Digital Sunset',
    'Stretch & Breathe',
    'Pamper Sunday',
    'Screen-Free Hour',
  ],
  Finance: [
    'Track Every Expense',
    'No-Spend Day',
    'Cook @ Home',
    'Compare Prices Habit',
    'Budget Check',
    'Savings Snapshot',
  ],
  Mindfulness: [
    'Mindful Walk',
    'Box Breathing',
    '1-min Pause Hourly',
    'Single-tasking',
    'Body Scan',
    'Observe & Note',
  ],
  Other: [
    'Declutter One Item',
    'Random Act of Kindness',
    'Nature Break',
    'Hydration Reminder',
    'Call a Friend',
    'Tech-Free Hour',
    'Watch the LOTR Trilogy',
  ],
};

const randItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const genCheckedDays = (N, fillBias = 0.65) => {
  const days = [];
  for (let d = 1; d <= N; d++) {
    if (Math.random() < fillBias) days.push(d);
  }
  return Array.from(new Set(days)).sort((a, b) => a - b);
};

let ensuredFailed = false;

const seed = async () => {
  try {
    const uri = process.env.MONGO_URI_TEST;
    if (!uri) {
      console.error('❌ MONGO_URI_TEST is not set in .env');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('✅ Connected to DB:', uri);

    const names = [
      'Darya',
      'Romanna',
      'Natalia',
      'Lima',
      'Alice',
      'Bob',
      'Charlie',
      'Diana',
      'Ethan',
      'Fiona',
      'George',
      'Hannah',
      'Ivan',
      'Julia',
      'Kevin',
    ];

    const users = [];
    for (const name of names) {
      const email = `${name.toLowerCase()}@peerquest-seed.test`;
      let user = await User.findOne({
        $or: [{ username: name }, { email }],
      });
      if (!user) {
        user = await User.create({
          username: name,
          email,
          password: 'password123',
        });
        console.log(`👤 Created user: ${name}`);
      } else {
        console.log(`👤 Using existing user: ${name}`);
      }
      users.push(user);
    }

    const makeCheckInsForParticipants = async (
      challenge,
      status,
      duration,
      participants
    ) => {
      for (const p of participants) {
        let startOffsetDays =
          status === 'active'
            ? randInt(0, Math.max(0, duration - 1))
            : duration + randInt(0, 3);
        const startDate = new Date(now - startOffsetDays * msPerDay);

        let checkedDays;
        if (status === 'completed') {
          checkedDays = Array.from({ length: duration }, (_, i) => i + 1);
        } else if (status === 'failed') {
          const cap = Math.max(1, Math.floor(duration * 0.5));
          checkedDays = genCheckedDays(cap, 0.7);
          ensuredFailed = true;
        } else {
          const currentDay = Math.min(duration, startOffsetDays + 1);
          checkedDays = genCheckedDays(currentDay, 0.6);
        }

        await CheckIn.create({
          challenge: challenge._id,
          user: p,
          startDate,
          checkedDays,
        });
      }
    };

    for (const creator of users) {
      const activeCount = randInt(4, 9);
      for (let i = 0; i < activeCount; i++) {
        const category = randItem(Object.keys(TITLE_BANK));
        const duration = randInt(1, 10);
        const others = users
          .filter((u) => u._id.toString() !== creator._id.toString())
          .sort(() => 0.5 - Math.random())
          .slice(0, randInt(1, 3));
        const participants = [creator._id, ...others.map((u) => u._id)];

        const title = randItem(TITLE_BANK[category]);
        const challenge = await Challenge.create({
          title,
          category,
          duration,
          status: 'active',
          creator: creator._id,
          participant: participants,
          invited: [],
        });

        await makeCheckInsForParticipants(
          challenge,
          'active',
          duration,
          participants
        );
      }

      if (Math.random() < 0.5) {
        const pastCount = randInt(1, 2);
        for (let i = 0; i < pastCount; i++) {
          const category = randItem(Object.keys(TITLE_BANK));
          const duration = randInt(1, 10);
          const others = users
            .filter((u) => u._id.toString() !== creator._id.toString())
            .sort(() => 0.5 - Math.random())
            .slice(0, randInt(1, 3));
          const participants = [creator._id, ...others.map((u) => u._id)];

          const status = Math.random() < 0.6 ? 'completed' : 'failed';
          const title = randItem(TITLE_BANK[category]);
          const challenge = await Challenge.create({
            title,
            category,
            duration,
            status,
            creator: creator._id,
            participant: participants,
            invited: [],
          });

          await makeCheckInsForParticipants(
            challenge,
            status,
            duration,
            participants
          );
        }
      }
    }

    if (!ensuredFailed) {
      const anyActive = await Challenge.findOne({ status: 'active' });
      if (anyActive) {
        anyActive.status = 'failed';
        await anyActive.save();
        ensuredFailed = true;
        console.log('⚠️ Flipped one active to failed.');
      }
    }

    console.log('🎉 Test seeding done.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeder error:', err);
    process.exit(1);
  }
};

seed();
