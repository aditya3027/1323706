const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const windowSize = 10;
const numbers = {
  p: [],
  f: [],
  e: [],
  r: []
};

async function fetchNumbers(id) {
  try {
    const response = await axios.get(`https://20.244.56.144/test/${id}`);
    return response.data.numbers;
  } catch (error) {
    console.error('Error fetching numbers:', error);
    return [];
  }
}

function updateNumbers(id, newNumbers) {
  const currentNumbers = numbers[id];
  for (const number of newNumbers) {
    if (currentNumbers.length >= windowSize) {
      currentNumbers.shift();
    }
    if (!currentNumbers.includes(number)) {
      currentNumbers.push(number);
    }
  }
}

function calculateAverage(numbers) {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
}

app.get('/numbers/:id', async (req, res) => {
  const id = req.params.id;
  if (!['p', 'f', 'e', 'r'].includes(id)) {
    return res.status(400).send('Invalid ID');
  }

  const newNumbers = await fetchNumbers(id);
  const prevState = [...numbers[id]];
  updateNumbers(id, newNumbers);
  const currState = [...numbers[id]];
  const avg = calculateAverage(currState);

  res.json({
    numbers: newNumbers,
    windowPrevState: prevState,
    windowCurrState: currState,
    avg: avg.toFixed(2)
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
