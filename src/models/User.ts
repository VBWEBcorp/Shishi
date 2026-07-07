import { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

import { registerModel } from '@/lib/register-model'

/**
 * Portefeuille de crédits PROPRE À UNE ACTIVITÉ (ex. crédits tennis).
 * 1 crédit = 1 h (ou 1 accès) de l'activité concernée, non transférable.
 *
 *  · `credits`  : solde restant pour la période en cours.
 *  · `monthly`  : rechargement AUTOMATIQUE mensuel (0 = pas d'automatique —
 *                 crédits ponctuels valables 1 mois, perdus à l'expiration).
 *  · `renewAt`  : fin de la période en cours. Passée cette date : si `monthly`
 *                 > 0 le solde repart à `monthly` (période suivante), sinon
 *                 les crédits sont expirés.
 */
export interface IActivityCredit {
  activity: string
  credits: number
  monthly: number
  renewAt?: Date
}

/**
 * Abonnement en cours d'un membre (issu du catalogue admin).
 * Purement descriptif : les crédits réels vivent dans `activityCredits`
 * (recharge auto mise en place lors de l'application). `undefined` = aucun.
 */
export interface IMemberSubscription {
  planId?: string
  name: string
  priceTHB: number
  startedAt: Date
}

export interface IUser extends Document {
  email: string
  password: string
  name?: string
  phone?: string
  role: 'user' | 'admin'
  /**
   * Crédits par activité (tennis, fitness…) — SEUL système d'avantages.
   * Attribués par l'admin lors du passage au club (paiement sur place),
   * en ponctuel (valables 1 mois) ou en recharge automatique mensuelle.
   */
  activityCredits: IActivityCredit[]
  /** Abonnement en cours (issu du catalogue admin), sinon undefined. */
  subscription?: IMemberSubscription
  /** Date d'adhésion (premiers crédits reçus). */
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
    // Portefeuilles de crédits par activité (voir IActivityCredit).
    activityCredits: {
      type: [
        {
          _id: false,
          activity: { type: String, required: true },
          credits: { type: Number, default: 0 },
          monthly: { type: Number, default: 0 },
          renewAt: Date,
        },
      ],
      default: [],
    },
    // Abonnement en cours (catalogue admin). Descriptif — voir IMemberSubscription.
    subscription: {
      type: {
        _id: false,
        planId: String,
        name: { type: String, required: true },
        priceTHB: { type: Number, default: 0 },
        startedAt: { type: Date, default: Date.now },
      },
      default: undefined,
    },
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

export default registerModel<IUser>('User', UserSchema)
