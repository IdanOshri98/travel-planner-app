import tripsStore from '../data/trips.store.js';
const { findTripById, nextWordId } = tripsStore;

function createWord(req, res){
    const tripId = Number(req.params.id);
    const trip = findTripById(tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const {
        word,
        translation,
    }= req.body;
    const rating=1;

    if (!word || !translation) return res.status(400).json({ message: 'word and translation are required' });

    const newWord = {
        id: nextWordId(trip),
        word,
        translation,
        rating
    }

    if (!Array.isArray(trip.words)) trip.words = [];
    trip.words.push(newWord);
    res.status(201).json(newWord);
}

function getWords(req, res) {
  const tripId = Number(req.params.id);
  const trip = findTripById(tripId);
  if (!trip) return res.status(404).json({ message: 'Trip not found' });
  
  if (!Array.isArray(trip.words)) trip.words = [];
  res.status(200).json(trip.words);
}

function editWord(req, res){ 
    const tripId = Number(req.params.tripId);
    const wordId = Number(req.params.wordId);

    
    const trip = findTripById(tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (!Array.isArray(trip.words)) trip.words = [];

    const idx = trip.words.findIndex(e => e.id === wordId);
    if (idx === -1) return res.status(404).json({ message: 'word not found' });

    trip.words[idx].rating = Number(req.body.rating);

    res.status(200).json(trip.words[idx])

}

function deleteWord(req, res) {
  const tripId = Number(req.params.tripId);
  const wordId = Number(req.params.wordId);

  const trip = findTripById(tripId);
  if (!trip) return res.status(404).json({ message: 'Trip not found' });

  const idx = trip.words.findIndex(e => e.id === wordId);
  if (idx === -1) return res.status(404).json({ message: 'word not found' });

  trip.words.splice(idx, 1);
  res.status(204).end();
}

export default { createWord, getWords, editWord, deleteWord };
