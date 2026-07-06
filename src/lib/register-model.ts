import mongoose, { type Model, type Schema } from 'mongoose'

/**
 * Enregistre (ou récupère) un modèle Mongoose de façon sûre en développement.
 *
 * Next.js garde le process Node vivant entre les hot-reloads : un modèle déjà
 * enregistré conserve son ANCIEN schéma. Tout ajout de champ (ex. `activityCredits`
 * sur User) n'est alors PAS pris en compte tant que le serveur n'est pas
 * redémarré — source de bugs silencieux « champ ignoré à l'écriture ».
 *
 * En développement on force la recompilation du modèle pour refléter le schéma
 * courant ; en production (process neuf à chaque déploiement) on garde le
 * comportement standard (modèle mis en cache).
 */
export function registerModel<T>(name: string, schema: Schema<T>): Model<T> {
  if (process.env.NODE_ENV !== 'production') {
    try {
      mongoose.deleteModel(name)
    } catch {
      /* modèle pas encore enregistré — rien à supprimer */
    }
  }
  return (mongoose.models[name] as Model<T>) || mongoose.model<T>(name, schema)
}
