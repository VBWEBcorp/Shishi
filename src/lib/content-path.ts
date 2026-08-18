/**
 * Lecture/écriture d'un champ de contenu à partir de son chemin ("hero.title",
 * "gallery.2", "values.0.text").
 *
 * C'est la mécanique de l'espace « Contenu du site » : chaque champ déclaré
 * dans `editable-pages.ts` porte un chemin, et ces deux fonctions font le lien
 * avec la structure réellement enregistrée puis relue par les pages publiques.
 * Une erreur ici ne casse rien visiblement dans l'admin — le champ se remplit
 * normalement — mais la page publique n'affiche pas la modification. D'où les
 * tests dédiés.
 */

/** Valeur d'un champ, ou `undefined` si le chemin n'existe pas encore. */
export function readPath(source: Record<string, any>, path: string): any {
  if (!source || !path) return undefined
  return path
    .split('.')
    .reduce<any>((acc, key) => (acc === null || acc === undefined ? undefined : acc[key]), source)
}

/**
 * Renvoie une copie de `source` avec la valeur écrite au chemin donné.
 *
 * Un segment numérique crée un TABLEAU et non un objet : `gallery.0` doit
 * produire `{ gallery: ["..."] }`. Avec un objet, on obtiendrait
 * `{ gallery: { "0": "..." } }`, que la page publique parcourt avec `.map()` —
 * elle n'afficherait donc aucune photo, sans la moindre erreur visible.
 */
export function writePath(
  source: Record<string, any>,
  path: string,
  value: any
): Record<string, any> {
  const next: Record<string, any> = source ? structuredClone(source) : {}
  const keys = path.split('.')
  let cursor: any = next

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    const childIsIndex = /^\d+$/.test(keys[i + 1])
    const current = cursor[key]
    const wrongShape =
      current === null ||
      typeof current !== 'object' ||
      (childIsIndex && !Array.isArray(current)) ||
      (!childIsIndex && Array.isArray(current))
    if (wrongShape) cursor[key] = childIsIndex ? [] : {}
    cursor = cursor[key]
  }

  cursor[keys[keys.length - 1]] = value
  return next
}
