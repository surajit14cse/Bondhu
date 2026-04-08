const icebreakers = [
  "What's your favorite way to spend a weekend?",
  "If you could travel anywhere in the world right now, where would you go?",
  "What's the best book you've read recently?",
  "Are you a coffee person or a tea person?",
  "What's your go-to karaoke song?",
  "If you could have dinner with any historical figure, who would it be?",
  "What's the most adventurous thing you've ever done?",
  "Do you have any pets?",
  "What's your favorite movie of all time?",
  "If you could only eat one cuisine for the rest of your life, what would it be?",
  "What's a hidden talent you have?",
  "Are you a morning person or a night owl?",
  "What's the best piece of advice you've ever received?",
  "What's your favorite thing about living in your city?",
  "If you won the lottery tomorrow, what's the first thing you'd buy?",
];

const getRandomIcebreaker = () => {
  const index = Math.floor(Math.random() * icebreakers.length);
  return icebreakers[index];
};

module.exports = { icebreakers, getRandomIcebreaker };
