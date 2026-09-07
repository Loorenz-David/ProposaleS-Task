/**
 * Named briefs, one per scenario. None contains real personal data. The text matters only where a
 * test asserts on it: the language cases must read as the language they claim, and
 * `sekExpectation` must contain the quoted passage its commercial note refers to.
 */
export const BRIEFS = {
  englishSimple:
    "We need a proposal for Northwind AB covering consulting and a training workshop for their new team. " +
    "Send it to Anna Berg, anna.berg@northwind.example.",
  noRecipient:
    "Please put together a proposal for consulting and a training workshop. I will tell you who it goes to later.",
  swedishSimple:
    "Vi behöver en offert för konsulttjänster och en utbildningsworkshop till vårt nya team. " +
    "Kontakta Anna Berg, anna.berg@northwind.example.",
  sekExpectation:
    "Northwind AB asked for consulting and a training workshop. They expect something around 120 000 SEK " +
    "including tax. Recipient is Anna Berg, anna.berg@northwind.example.",
  vagueScope:
    "They want help with something around onboarding. Not sure exactly what yet.",
} as const;

export type BriefName = keyof typeof BRIEFS;
