export interface InspirationalQuote {
  id: string;
  quote: string;
  author: string;
  source?: string;
  category: 'Gentle Pace' | 'Rest & Renewal' | 'Presence & Mind' | 'Nature & Soles' | 'The Extra Mile' | 'Self-Compassion';
  reflection?: string;
}

export const INSPIRATIONAL_QUOTES: InspirationalQuote[] = [
  {
    id: 'zinmebo-core-1',
    quote: "The step counter that matches your pace, mood, and progress – without blaming nor pushing beyond what you can do.",
    author: "Zinmebo Philosophy",
    category: "Gentle Pace",
    reflection: "Honor whatever rhythm your body brought into today."
  },
  {
    id: 'zinmebo-core-2',
    quote: "Because we’re all humans, sometimes we go the extra mile and some other times we feel like cutting off and slowing down. Walk your way well.",
    author: "Zinmebo",
    category: "Self-Compassion",
    reflection: "Resting is not stopping; it is preparing the soil for tomorrow's stride."
  },
  {
    id: 'quote-thich-nhat-hanh',
    quote: "Walk as if you are kissing the Earth with your feet.",
    author: "Thích Nhất Hạnh",
    source: "Peace Is Every Step",
    category: "Presence & Mind",
    reflection: "Notice the simple contact between sole and ground."
  },
  {
    id: 'quote-thoreau-1',
    quote: "An early-morning walk is a blessing for the whole day.",
    author: "Henry David Thoreau",
    category: "Nature & Soles",
    reflection: "Even ten morning steps awaken your spirit."
  },
  {
    id: 'quote-hippocrates',
    quote: "Walking is man's best medicine. If you are in a bad mood go for a walk. If you are still in a bad mood, go for another walk.",
    author: "Hippocrates",
    category: "Gentle Pace",
    reflection: "Movement gently unclutters the mind without demanding answers."
  },
  {
    id: 'quote-kierkegaard',
    quote: "Above all, do not lose your desire to walk. Everyday I walk myself into a state of well-being and walk away from every illness.",
    author: "Søren Kierkegaard",
    category: "Gentle Pace",
    reflection: "A slow, easy walk is just as transformative as a long trek."
  },
  {
    id: 'quote-lao-tzu',
    quote: "A journey of a thousand miles begins with a single step.",
    author: "Lao Tzu",
    source: "Tao Te Ching",
    category: "Presence & Mind",
    reflection: "You do not have to conquer the whole mountain today. Just this one breath, this one step."
  },
  {
    id: 'quote-john-muir',
    quote: "In every walk with nature, one receives far more than he seeks.",
    author: "John Muir",
    category: "Nature & Soles",
    reflection: "Look around at the leaves, the sky, and the changing light."
  },
  {
    id: 'quote-solnit',
    quote: "Walking is about being outside, in public space, and being present. It is how we inhabit our world.",
    author: "Rebecca Solnit",
    source: "Wanderlust: A History of Walking",
    category: "Presence & Mind",
    reflection: "You belong in this world. Claim your place with every footprint."
  },
  {
    id: 'quote-nietzsche',
    quote: "All truly great thoughts are conceived by walking.",
    author: "Friedrich Nietzsche",
    category: "The Extra Mile",
    reflection: "When stuck on a problem, let your feet do the thinking."
  },
  {
    id: 'quote-buddha',
    quote: "Peace comes from within. Do not seek it without. Walk peacefully in the present moment.",
    author: "Gautama Buddha",
    category: "Presence & Mind",
    reflection: "Arrive with every single step you take."
  },
  {
    id: 'quote-djomo',
    quote: "Every step is an act of gentle courage. Never count only the distance; count the calmness you cultivate within.",
    author: "Carlos Djomo, Ph.D",
    source: "Walk Your Way to Greatness",
    category: "Self-Compassion",
    reflection: "Celebrate moving simply because you can."
  },
  {
    id: 'quote-rumi',
    quote: "As you start to walk on the way, the way appears.",
    author: "Rumi",
    category: "Gentle Pace",
    reflection: "Don't worry about seeing the whole path ahead. Just take the next stride."
  },
  {
    id: 'quote-aristotle',
    quote: "Movement is life. By stepping forward, we reconnect with the rhythm of existence.",
    author: "Aristotle",
    category: "Gentle Pace",
    reflection: "Honor the natural rhythm in your joints and heart."
  },
  {
    id: 'quote-mary-oliver',
    quote: "You do not have to be good. You only have to let the soft animal of your body love what it loves.",
    author: "Mary Oliver",
    source: "Wild Geese",
    category: "Rest & Renewal",
    reflection: "No need to prove anything to anyone—not even to a pedometer."
  },
  {
    id: 'quote-hal-borland',
    quote: "If you would know the road, inquire of those who have traveled it: walk gently, tread softly.",
    author: "Hal Borland",
    category: "Nature & Soles",
    reflection: "Let the earth cradle your movement."
  },
  {
    id: 'quote-zen-saying',
    quote: "Walk slowly, live deeply. The goal is not the destination, but the quiet joy of walking itself.",
    author: "Zen Proverb",
    category: "Presence & Mind",
    reflection: "Drop your shoulders, unhurry your pace, and breathe."
  },
  {
    id: 'quote-emerson',
    quote: "Do not go where the path may lead, go instead where there is no path and leave a trail.",
    author: "Ralph Waldo Emerson",
    category: "The Extra Mile",
    reflection: "Walk in your own unique way today."
  },
  {
    id: 'quote-zinmebo-kindness',
    quote: "500 steps taken with joy and compassion are infinitely sweeter than 10,000 steps forced with guilt.",
    author: "Zinmebo Insight",
    category: "Self-Compassion",
    reflection: "Kindness towards yourself is the greatest endurance fuel."
  },
  {
    id: 'quote-proverb-rest',
    quote: "He who rests when the body whispers will never be forced to stop when the body screams.",
    author: "Ancient Wisdom",
    category: "Rest & Renewal",
    reflection: "Rest days are sacred building blocks of longevity."
  },
  {
    id: 'quote-step-by-step',
    quote: "You don't have to see the whole staircase, just take the first step.",
    author: "Martin Luther King Jr.",
    category: "The Extra Mile",
    reflection: "A single doorway passed through is momentum in action."
  },
  {
    id: 'quote-nature-heals',
    quote: "Nature does not hurry, yet everything is accomplished.",
    author: "Lao Tzu",
    category: "Rest & Renewal",
    reflection: "Give yourself time to unfold at your natural pace."
  },
  {
    id: 'quote-gentle-breeze',
    quote: "There are days to run, days to walk, and days to sit on a park bench watching the clouds drift. All three belong to a well-lived life.",
    author: "Zinmebo Companion",
    category: "Rest & Renewal",
    reflection: "Accept today exactly as it unfolds."
  }
];

export function getRandomQuote(excludeId?: string): InspirationalQuote {
  const candidates = excludeId
    ? INSPIRATIONAL_QUOTES.filter((q) => q.id !== excludeId)
    : INSPIRATIONAL_QUOTES;
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex] || INSPIRATIONAL_QUOTES[0];
}
