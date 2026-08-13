export function visiblePostFilter() {
  return {
    published: true,
    publishedAt: { $lte: new Date() },
  }
}

// Un article déposé par PHARE appartient à UNE langue et n'est listé que dans
// celle-ci. Les articles historiques n'ont pas de champ `locale` : ils restent
// visibles dans les deux langues, comme avant.
export function localeFilter(locale: string) {
  return { $or: [{ locale }, { locale: { $exists: false } }] }
}
