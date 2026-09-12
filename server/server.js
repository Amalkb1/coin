import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

const decisions = {
  relationship: ['Text their best friend.', 'Like their post from 2019.', 'Send a seven-minute voice note.', 'Create a group chat called IMPORTANT.'],
  exam: ['Watch reels instead.', 'Rearrange your desktop icons.', 'Study tomorrow morning.', 'Clean your room in alphabetical order.'],
  food: ['Order enough for the entire hostel.', 'Order dessert first.', 'Order the most expensive thing.', 'Add three sides you will forget to eat.'],
  money: ['Buy two because one is lonely.', 'Add everything to cart.', 'Subscribe to something you do not need.', 'Buy it because it is on sale.'],
  sleep: ['Watch one more reel.', 'Open YouTube for research.', 'Set an alarm for 5 AM and sleep at 3 AM.', 'Start reorganizing your room.'],
  social: ['Say “we need to talk” and disappear.', 'Ask a random stranger.', 'Make a group chat.', 'Reply with a thumbs-up and nothing else.'],
  general: ['Do the opposite of your first instinct.', 'Make a spreadsheet about it.', 'Flip another coin.', 'Overthink it for six hours.']
}

function classify(question = '') {
  const text = question.toLowerCase()
  if (/text|date|crush|him|her|relationship|friend|love/.test(text)) return 'relationship'
  if (/study|exam|class|homework|hackathon|school/.test(text)) return 'exam'
  if (/eat|food|order|biriyani|pizza|lunch|dinner/.test(text)) return 'food'
  if (/buy|money|cart|sale|spend|purchase/.test(text)) return 'money'
  if (/sleep|bed|tired|alarm|nap/.test(text)) return 'sleep'
  if (/party|go out|people|social|invite/.test(text)) return 'social'
  return 'general'
}

app.post('/api/decision', (req, res) => {
  const category = classify(req.body.question)
  const options = decisions[category]
  const decision = options[Math.floor(Math.random() * options.length)]
  res.json({ category, decision, confidence: 4, quality: -87, regret: 92 + Math.floor(Math.random() * 7) })
})

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'coin-t-decide' }))

const port = process.env.PORT || 3001
app.listen(port, () => console.log(`Coin server listening on http://localhost:${port}`))
