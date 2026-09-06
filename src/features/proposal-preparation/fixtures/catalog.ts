import type { ContentItem } from "@/lib/proposales";

const CREATED_AT = "2026-01-01T00:00:00.000Z";

// Long descriptions for the truncation-boundary items (task 3): built once here so the
// over-cap and exact-cap lengths are visibly correct rather than hand-counted in prose.
const LONG_DESCRIPTION_BASE = "Provides extended onboarding, structured workshops, and milestone check-ins throughout the full engagement lifecycle for the whole account team, including office hours and quarterly reviews.";
const LONG_DESCRIPTION_FILLER = " Additional account coordination continues after launch.";
const LONG_DESCRIPTION_SOURCE = (LONG_DESCRIPTION_BASE + LONG_DESCRIPTION_FILLER.repeat(3));
export const OVER_CAP_DESCRIPTION_EN = LONG_DESCRIPTION_SOURCE.slice(0, 301);
export const EXACT_CAP_DESCRIPTION_EN = LONG_DESCRIPTION_SOURCE.slice(0, 280);

export const FIXTURE_CATALOG: ContentItem[] = [
  {
    variationId: "1",
    productId: "500101",
    createdAt: CREATED_AT,
    title: { en: "Consulting Training Service Bundle", sv: "Konsult- och utbildningstjänst" },
    description: {
      en: "Includes a guided workshop for onboarding.",
      sv: "Inkluderar en guidad introduktion för teamet.",
    },
  },
  {
    variationId: "2",
    productId: "500102",
    createdAt: CREATED_AT,
    title: { en: "Consulting Workshop Service Track", sv: "Konsult- och workshoptjänst" },
    description: {
      en: "Delivered onsite with dedicated facilitators.",
      sv: "Genomförs på plats med dedikerade handledare.",
    },
  },
  {
    variationId: "3",
    productId: "500103",
    createdAt: CREATED_AT,
    title: { en: "Training Service Overview", sv: "Utbildningstjänst översikt" },
    description: {
      en: "A structured workshop follows the kickoff.",
      sv: "En strukturerad uppföljning sker efter starten.",
    },
  },
  {
    variationId: "4",
    productId: "500104",
    createdAt: CREATED_AT,
    title: { en: "Training Service Fundamentals", sv: "Grundläggande utbildningstjänst" },
    description: {
      sv: "En introduktion till de grundläggande momenten.",
    },
  },
  {
    variationId: "5",
    productId: "500105",
    createdAt: CREATED_AT,
    title: { en: "Service Analytics Dashboard", sv: "Servicetjänst för analys" },
    description: {
      en: "Consulting and workshop resources included.",
      sv: "Konsultation och verktyg ingår i tjänsten.",
    },
  },
  {
    variationId: "6",
    productId: "500106",
    createdAt: CREATED_AT,
    title: { en: "Service Deployment Toolkit", sv: "Servicetjänst för driftsättning" },
    description: {
      en: "Includes training materials for new hires.",
      sv: "Innehåller material för nyanställda.",
    },
  },
  {
    variationId: "7",
    productId: "500107",
    createdAt: CREATED_AT,
    title: { en: "Premium Service Suite" },
    description: {
      en: "Executive-level engagement management.",
      sv: "Hantering på ledningsnivå för uppdraget.",
    },
  },
  {
    variationId: "8",
    productId: "500108",
    createdAt: CREATED_AT,
    title: { en: "Regional Service Bundle", sv: "   ", no: "   " },
    description: {
      en: "Covers multi-market delivery coordination.",
      sv: "Omfattar leverans över flera marknader.",
    },
  },
  {
    variationId: "9",
    productId: "500109",
    createdAt: CREATED_AT,
    title: { en: "Standard Meeting Service Package", sv: "Standardtjänst för möten" },
    description: {
      en: "Includes standard facilitation and materials.",
      sv: "Inkluderar standardfacilitering och material.",
    },
  },
  {
    variationId: "10",
    productId: "500110",
    createdAt: CREATED_AT,
    title: { en: "Standard Meeting Service Package", sv: "Standardtjänst för möten" },
    description: {
      en: "Includes standard facilitation and materials.",
      sv: "Inkluderar standardfacilitering och material.",
    },
  },
  {
    variationId: "11",
    productId: "500111",
    createdAt: CREATED_AT,
    title: { en: "Premium Service Circle", sv: "Premiumtjänst cirkel" },
    description: {
      en: "Structured account management touchpoints.",
      sv: "Inkluderar en guidad fjällvandring för teamet.",
    },
  },
  {
    variationId: "12",
    productId: "500112",
    createdAt: CREATED_AT,
    title: { en: "Extended Service Rollout", sv: "Utökad servicetjänst" },
    description: {
      en: OVER_CAP_DESCRIPTION_EN,
      sv: "Utökat stöd under hela utrullningen.",
    },
  },
  {
    variationId: "13",
    productId: "500113",
    createdAt: CREATED_AT,
    title: { en: "Compact Service Starter", sv: "Kompakt servicetjänst" },
    description: {
      en: "A brief onboarding call to align on scope.",
      sv: "Ett kort introduktionssamtal om omfattningen.",
    },
  },
  {
    variationId: "14",
    productId: "500114",
    createdAt: CREATED_AT,
    title: { en: "Balanced Service Package", sv: "Balanserad servicetjänst" },
    description: {
      en: EXACT_CAP_DESCRIPTION_EN,
      sv: "Balanserat stöd genom hela leveransen.",
    },
  },
];
