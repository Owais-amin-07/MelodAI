export const SINGING_QUOTES = [
  "To sing is to walk on water.",
  "The only thing better than singing is more singing.",
  "He who sings scares away his woes.",
  "Singing is like a celebration of oxygen.",
  "God respects me when I work, but he loves me when I sing.",
  "Sometimes I think I have a good voice, and sometimes I think I'm just loud.",
  "Music is the wine that fills the cup of silence.",
  "The vocal cords are like a muscle. You have to train them.",
  "Great singers aren't great because of their technique, they are great because of their passion.",
  "If I cannot fly, let me sing."
];

export const getRandomQuote = () => {
  return SINGING_QUOTES[Math.floor(Math.random() * SINGING_QUOTES.length)];
};
