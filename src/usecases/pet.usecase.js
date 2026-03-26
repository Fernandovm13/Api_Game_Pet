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
  if (stats.hunger <= 20) return 'hungry';
  if (stats.energy <= 20) return 'tired';
  if (stats.happiness <= 20) return 'bored';
  if (stats.happiness >= 80) return 'happy';
  return 'neutral';
}


function calculateLevel(experience) {
  const BASE_XP = 900; 
  if (experience < BASE_XP) {
    return Math.floor(experience / 100) + 1;
  } else {
    const extraXP = experience - BASE_XP;
    return 10 + Math.floor(extraXP / 200);
  }
}

function decayStats(bundle) {
  const now = Date.now();
  const lastUpdate = new Date(bundle.stats_updated_at || new Date()).getTime();
  const minutesPassed = Math.max(0, (now - lastUpdate) / 60000);

  const stats = {
    hunger: bundle.hunger,
    energy: bundle.energy,
    happiness: bundle.happiness,
    experience: bundle.experience,
    level: bundle.level
  };

  let isSleeping = !!bundle.is_sleeping;

  if (minutesPassed < 1) {
    return { changed: false, stats, minutesPassed, isSleeping };
  }

  if (isSleeping) {
    stats.energy = clamp(stats.energy + minutesPassed * 2);
    
    stats.hunger = clamp(stats.hunger - minutesPassed * 0.5);
    stats.happiness = clamp(stats.happiness - minutesPassed * 0.1);

    if (stats.energy >= 100) {
      isSleeping = false;
    }
  } else {
    stats.hunger = clamp(stats.hunger - minutesPassed * 2);
    stats.energy = clamp(stats.energy - minutesPassed * 0.5);
    stats.happiness = clamp(stats.happiness - minutesPassed * 0.5);
  }

  return { changed: true, stats, minutesPassed, isSleeping };
}

function buildEvents(prevStats, nextStats, isSleeping) {
  const events = [];

  if (nextStats.hunger <= 20 && prevStats.hunger > 20) {
    events.push({
      type: 'HUNGER',
      title: 'Tengo hambre',
      body: 'Neo necesita comer algo pronto.'
    });
  }

  if (!isSleeping && nextStats.energy <= 20 && prevStats.energy > 20) {
    events.push({
      type: 'TIRED',
      title: 'Tengo sueño',
      body: 'Neo necesita dormir para recuperar energía.'
    });
  }

  if (!isSleeping && nextStats.happiness <= 20 && prevStats.happiness > 20) {
    events.push({
      type: 'BORED',
      title: 'Estoy aburrido',
      body: '¡Neo quiere jugar contigo!'
    });
  }

  if (nextStats.level > prevStats.level) {
    events.push({
      type: 'LEVEL_UP',
      title: '¡Sube de nivel!',
      body: `Neo ha alcanzado el nivel ${nextStats.level}.`
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
      if (stats.hunger >= 100) throw new Error('Neo ya está lleno, no quiere comer más.');
      stats.hunger = clamp(stats.hunger + 30);
      stats.experience += 10;
      break;

    case 'play':
      if (pet.is_sleeping) throw new Error('No puedes jugar con una mascota dormida.');
      if (stats.energy < 10) throw new Error('Neo está demasiado cansado para jugar.');
      if (stats.happiness >= 100) throw new Error('Neo ya está muy feliz, no quiere jugar más por ahora.');
      stats.happiness = clamp(stats.happiness + 25);
      stats.hunger = clamp(stats.hunger - 10);
      stats.energy = clamp(stats.energy - 5);
      stats.experience += 15;
      break;

    case 'sleep':
      if (pet.is_sleeping) return state; 
      if (stats.energy >= 95) throw new Error('Neo no tiene sueño ahora.');
      pet.is_sleeping = true;
      break;

    case 'wake':
      if (!pet.is_sleeping) return state; 
      pet.is_sleeping = false;
      break;

    case 'talk':
      if (pet.is_sleeping) {
        stats.happiness = clamp(stats.happiness + 2);
      } else {
        stats.happiness = clamp(stats.happiness + 10);
        stats.experience += 5;
      }
      break;

    default:
      throw new Error(`Acción "${action}" no soportada.`);
  }

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