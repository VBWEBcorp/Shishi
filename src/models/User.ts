import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

import type { MembershipPlan } from '@/lib/membership-plans'

/** Formule d'abonnement de l'adhérent ('none' = compte sans abonnement actif). */
export type { MembershipPlan }

export interface IUser extends Document {
  email: string
  password: string
  name?: string
  phone?: string
  role: 'user' | 'admin'
  /** Abonnement en cours (crédits mensuels + remise + réservation anticipée). */
  plan: MembershipPlan
  /** Crédits restants pour la période en cours (perdus au renouvellement). */
  credits: number
  /** Date de renouvellement de l'abonnement (remise à zéro des crédits). */
  renewAt?: Date
  /** Date d'adhésion (première souscription). */
  memberSince?: Date
  createdAt: Date
  updatedAt: Date
  comparePassword(password: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    name: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    plan: {
      type: String,
      enum: ['none', 'bronze', 'silver', 'gold'],
      default: 'none',
    },
    credits: {
      type: Number,
      default: 0,
    },
    renewAt: Date,
    memberSince: Date,
  },
  {
    timestamps: true,
  }
)

// Hash password before saving. Hook ASYNC : Mongoose attend la promesse
// retournée (pas de callback `next` en mode async) — on lève simplement en cas
// d'erreur pour interrompre la sauvegarde.
UserSchema.pre('save', async function (this: any) {
  if (!this.isModified('password')) return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Method to compare passwords
UserSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password)
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
