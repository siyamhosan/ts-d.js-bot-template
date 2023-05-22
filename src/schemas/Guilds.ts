import mongoose, { Document, Model } from 'mongoose'

type subscription = {
  type: '7d-Trial' | 'premium'
  paymentStatus: 'paid' | 'deu'
  lastPaid: Date
  renewDate: Date
}
// Define the schema
const GuildSchema = new mongoose.Schema({
  id: String,
  name: String,
  prefix: { type: String, default: '?' },
  managers: [String],
  subscription: {
    type: String,
    paymentStatus: String,
    lastPaid: Date,
    renewDate: Date
  }
})

// q: suggest me some a subscription type for a Premium discord bot

// Define the document interface (optional)
interface IGuild extends Document {
  id: string
  name: string
  prefix: string | '?'
  managers: string[]
  subscription: subscription
}

// Define the model
const GuildModel: Model<IGuild> = mongoose.model<IGuild>(
  'Guild',
  GuildSchema,
  'Guilds'
)

export { GuildModel, IGuild }
