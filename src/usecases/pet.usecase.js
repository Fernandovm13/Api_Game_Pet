const {
  getPetBundleByUserId,
  updatePetStats,
  updatePetActionTimestamps,
  insertInteraction
} = require('../repositories/pet.repository');

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function deriveMood(pet, stats) {
  if (pet.is_sleeping) return 'sleeping';
  if (stats.hunger >= 80) return 'hungry';
  if (stats.energy <= 20) return 'tired';
  if (stats.happiness >= 80) return 'happy';
  return 'neutral';
}

function calculateLevel(experience) {
  return Math.floor(experience / 100) + 1;
}

function decayStats(bundle) {
  const now = Date.now();
  const last = new Date(bundle.stats_updated_at || new Date()).getTime();
  const hours = Math.max(0, (now - last) / 3600000);

  const stats = {
    hunger: bundle.hunger,
    energy: bundle.energy,
    happiness: bundle.happiness,
    experience: bundle.experience,
    level: bundle.level
  };

  let isSleeping = !!bundle.is_sleeping;

  if (hours < 0.05) {
    return { changed: false, stats, hours, isSleeping };
  }

  if (isSleeping) {
    stats.energy = clamp(stats.energy + hours * 15); // Faster recovery
    stats.hunger = clamp(stats.hunger + hours * 2);
    stats.happiness = clamp(stats.happiness - hours * 1);

    // Auto-wake if energy is full
    if (stats.energy >= 100) {
      isSleeping = false;
    }
  } else {
    stats.energy = clamp(stats.energy - hours * 10);
    stats.hunger = clamp(stats.hunger + hours * 10);
    stats.happiness = clamp(stats.happiness - hours * 5);
  }

  return { changed: true, stats, hours, isSleeping };
}

function buildEvents(prevStats, nextStats, isSleeping) {
  const events = [];

  if (prevStats.hunger < 85 && nextStats.hunger >= 85) {
    events.push({
      type: 'HUNGER',
      title: 'Tu mascota tiene hambre',
      body: 'Necesita comida pronto.'
    });
  }

  if (!isSleeping && prevStats.energy > 15 && nextStats.energy <= 15) {
    events.push({
      type: 'TIRED',
      title: 'Tu mascota está cansada',
      body: 'Es hora de dormir o descansar.'
    });
  }

  if (nextStats.level > prevStats.level) {
    events.push({
      type: 'LEVEL_UP',
      title: '¡Subida de nivel!',
      body: `Tu mascota ahora es nivel ${nextStats.level}.`
    });
  }

  return events;
}

async function getCurrentPetState(userId) {
  const bundle = await getPetBundleByUserId(userId);
  if (!bundle) return null;

  const decay = decayStats(bundle);

  const pet = {
    id: bundle.pet_id,
    name: bundle.pet_name,
    species: bundle.species,
    level: decay.stats.level,
    experience: decay.stats.experience,
    mood: bundle.mood,
    is_sleeping: decay.isSleeping,
    image_url: bundle.image_url
  };

  let stats = {
    hunger: decay.stats.hunger,
    energy: decay.stats.energy,
    happiness: decay.stats.happiness
  };

  let events = [];

  if (decay.changed || decay.isSleeping !== !!bundle.is_sleeping) {
    const nextMood = deriveMood(pet, decay.stats);
    events = buildEvents(bundle, decay.stats, decay.isSleeping);

    await updatePetStats(pet.id, decay.stats, nextMood, decay.isSleeping);

    pet.mood = nextMood;
  }

  return {
    user: {
      id: bundle.user_id,
      firebase_uid: bundle.firebase_uid,
      email: bundle.email,
      name: bundle.user_name,
      avatar_url: bundle.avatar_url
    },
    pet,
    stats,
    events
  };
}

async function applyAction(userId, action, payload = {}) {
  const state = await getCurrentPetState(userId);
  if (!state) return null;

  const pet = { ...state.pet };
  const stats = {
    ...state.stats,
    experience: pet.experience,
    level: pet.level
  };
  const prevStats = { ...stats };

  switch (action) {
    case 'feed':
      if (pet.is_sleeping) throw new Error('No puedes alimentar a una mascota dormida.');
      stats.hunger = clamp(stats.hunger - 35);
      stats.happiness = clamp(stats.happiness + 5);
      stats.experience += 10;
      break;

    case 'play':
      if (pet.is_sleeping) throw new Error('No puedes jugar con una mascota dormida.');
      if (stats.energy < 10) throw new Error('Tu mascota está demasiado cansada para jugar.');
      stats.happiness = clamp(stats.happiness + 20);
      stats.energy = clamp(stats.energy - 15);
      stats.hunger = clamp(stats.hunger + 10);
      stats.experience += 15;
      break;

    case 'sleep':
      if (pet.is_sleeping) return state; // Already sleeping
      if (stats.energy >= 95) throw new Error('Tu mascota no tiene sueño ahora.');
      pet.is_sleeping = true;
      break;

    case 'wake':
      if (!pet.is_sleeping) return state; // Already awake
      pet.is_sleeping = false;
      break;

    case 'talk':
      if (pet.is_sleeping) {
        stats.happiness = clamp(stats.happiness + 2);
      } else {
        stats.happiness = clamp(stats.happiness + 8);
        stats.experience += 5;
      }
      break;

    default:
      throw new Error(`Acción "${action}" no soportada.`);
  }

  // Recalculate level
  stats.level = calculateLevel(stats.experience);

  const mood = deriveMood(pet, stats);
  const events = buildEvents(prevStats, stats, pet.is_sleeping);

  await updatePetStats(pet.id, stats, mood, pet.is_sleeping);
  await updatePetActionTimestamps(pet.id, action);
  await insertInteraction(userId, pet.id, action.toUpperCase(), payload);

  return {
    user: state.user,
    pet: {
      ...pet,
      level: stats.level,
      experience: stats.experience,
      mood
    },
    stats: {
      hunger: stats.hunger,
      energy: stats.energy,
      happiness: stats.happiness
    },
    events
  };
}

function makePetVoice(text) {
  const clean = String(text || '').trim();

  if (!clean) {
    return {
      reply_text: '...zZz',
      pitch: 1.35,
      rate: 0.95
    };
  }

  return {
    reply_text: clean,
    pitch: 1.5,
    rate: 1.1
  };
}

module.exports = {
  getCurrentPetState,
  applyAction,
  makePetVoice
};