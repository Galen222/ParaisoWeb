import React from "react";
import Head from "next/head";
import { useCspNonce } from "../contexts/CspNonceContext";

type JsonObject = Record<string, unknown>;

type PostalAddressInput = string | JsonObject;

interface JsonLdBaseProps {
  scriptId?: string;
  keyOverride?: string;
}

interface OrganizationJsonLdProps extends JsonLdBaseProps {
  type?: string;
  id?: string;
  name: string;
  logo?: string;
  url: string;
  legalName?: string;
  sameAs?: string[];
  address?: PostalAddressInput | PostalAddressInput[];
  contactPoints?: JsonObject[];
  contactPoint?: JsonObject[];
}

interface LocalBusinessJsonLdProps extends JsonLdBaseProps {
  type: string;
  id: string;
  name: string;
  description: string;
  url?: string;
  telephone?: string;
  address: PostalAddressInput | PostalAddressInput[];
  geo?: JsonObject;
  images?: string[];
  rating?: JsonObject;
  review?: JsonObject | JsonObject[];
  priceRange?: string;
  servesCuisine?: string | string[];
  sameAs?: string[];
  branchCode?: string;
  parentOrganization?: JsonObject;
  openingHours?: JsonObject | JsonObject[];
  action?: JsonObject;
  areaServed?: JsonObject[];
  makesOffer?: JsonObject[];
}

const compactObject = (entries: Array<[string, unknown]>): JsonObject =>
  Object.fromEntries(entries.filter(([, value]) => value !== undefined));

const toPostalAddress = (address: unknown): unknown => {
  if (typeof address === "string") {
    return address;
  }
  if (!address || typeof address !== "object") {
    return address;
  }

  return compactObject([["@type", "PostalAddress"], ...Object.entries(address as JsonObject)]);
};

const normalizeAddress = (address: unknown): unknown => {
  if (!Array.isArray(address)) {
    return toPostalAddress(address);
  }
  if (address.length === 1) {
    return toPostalAddress(address[0]);
  }
  return address.map(toPostalAddress);
};

const normalizeContactPoints = (contactPoints: unknown): unknown => {
  if (!Array.isArray(contactPoints) || contactPoints.length === 0) {
    return undefined;
  }

  return contactPoints.map((item) =>
    item && typeof item === "object"
      ? compactObject([["@type", "ContactPoint"], ...Object.entries(item as JsonObject)])
      : item
  );
};

const normalizeGeo = (geo: unknown): unknown =>
  geo && typeof geo === "object"
    ? compactObject([...Object.entries(geo as JsonObject), ["@type", "GeoCoordinates"]])
    : undefined;

const normalizeRating = (rating: unknown): unknown => {
  if (!rating || typeof rating !== "object") {
    return undefined;
  }
  const value = rating as JsonObject;
  return compactObject([
    ["@type", "AggregateRating"],
    ["ratingCount", value.ratingCount],
    ["reviewCount", value.reviewCount],
    ["bestRating", value.bestRating],
    ["ratingValue", value.ratingValue],
    ["worstRating", value.worstRating],
  ]);
};

const normalizeAuthor = (author: unknown): unknown => {
  if (typeof author === "string") {
    return { "@type": "Person", name: author };
  }
  if (!author || typeof author !== "object") {
    return undefined;
  }
  const value = author as JsonObject;
  if (!value.name) {
    return undefined;
  }
  return compactObject([
    ["@type", value.type ?? "Person"],
    ["name", value.name],
    ["url", value.url],
  ]);
};

const normalizeReviews = (reviews: unknown): unknown => {
  const normalizeReview = (review: unknown): unknown => {
    if (!review || typeof review !== "object") {
      return review;
    }
    const { reviewRating, author, publisher, ...rest } = review as JsonObject;
    const normalizedReviewRating =
      reviewRating && typeof reviewRating === "object"
        ? compactObject([...Object.entries(reviewRating as JsonObject), ["@type", "Rating"]])
        : undefined;
    const normalizedPublisher =
      publisher && typeof publisher === "object"
        ? compactObject([
            ["@type", "Organization"],
            ["name", (publisher as JsonObject).name],
          ])
        : undefined;

    return compactObject([
      ...Object.entries(rest),
      ["@type", "Review"],
      ["author", normalizeAuthor(author)],
      ["reviewRating", normalizedReviewRating],
      ["publisher", normalizedPublisher],
    ]);
  };

  return Array.isArray(reviews) ? reviews.map(normalizeReview) : normalizeReview(reviews);
};

const normalizeAction = (action: unknown): unknown => {
  if (!action || typeof action !== "object") {
    return undefined;
  }
  const value = action as JsonObject;
  return compactObject([
    ["@type", value.actionType],
    ["name", value.actionName],
    ["target", value.target],
  ]);
};

const normalizeAreaServed = (areas: unknown): unknown => {
  if (!Array.isArray(areas)) {
    return undefined;
  }
  return areas.map((area) => {
    if (!area || typeof area !== "object") {
      return area;
    }
    const value = area as JsonObject;
    const midpoint = value.geoMidpoint;
    return compactObject([
      ["@type", "GeoCircle"],
      ["geoMidpoint", normalizeGeo(midpoint)],
      ["geoRadius", value.geoRadius],
    ]);
  });
};

const normalizeOffers = (offers: unknown): unknown => {
  if (!Array.isArray(offers)) {
    return undefined;
  }
  return offers.map((offer) => {
    if (!offer || typeof offer !== "object") {
      return offer;
    }
    const { priceSpecification, itemOffered, ...rest } = offer as JsonObject;
    const normalizedPrice =
      priceSpecification && typeof priceSpecification === "object"
        ? compactObject([
            ["@type", (priceSpecification as JsonObject).type],
            ["priceCurrency", (priceSpecification as JsonObject).priceCurrency],
            ["price", (priceSpecification as JsonObject).price],
          ])
        : undefined;
    const normalizedItem =
      itemOffered && typeof itemOffered === "object"
        ? compactObject([...Object.entries(itemOffered as JsonObject), ["@type", "Service"]])
        : undefined;

    return compactObject([
      ...Object.entries(rest),
      ["@type", "Offer"],
      ["priceSpecification", normalizedPrice],
      ["itemOffered", normalizedItem],
    ]);
  });
};

const normalizeOpeningHours = (openingHours: unknown): unknown => {
  const normalizeOpeningHour = (item: unknown): unknown =>
    item && typeof item === "object"
      ? compactObject([...Object.entries(item as JsonObject), ["@type", "OpeningHoursSpecification"]])
      : undefined;

  return Array.isArray(openingHours)
    ? openingHours.map(normalizeOpeningHour)
    : normalizeOpeningHour(openingHours);
};

const serializeJsonLd = (value: JsonObject): string =>
  JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

interface JsonLdScriptProps {
  data: JsonObject;
  id?: string;
  scriptKey: string;
  keyOverride?: string;
}

const JsonLdScript = ({ data, id, scriptKey, keyOverride }: JsonLdScriptProps): React.JSX.Element => {
  const nonce = useCspNonce();

  return (
    <Head>
      <script
        id={id}
        data-testid={id}
        key={`jsonld-${scriptKey}${keyOverride ? `-${keyOverride}` : ""}`}
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
      />
    </Head>
  );
};

/** JSON-LD de organización compatible con una CSP estricta basada en nonce. */
export const OrganizationJsonLd = ({
  type = "Organization",
  id,
  name,
  logo,
  url,
  legalName,
  sameAs,
  address,
  contactPoints,
  contactPoint,
  scriptId,
  keyOverride,
  ...rest
}: OrganizationJsonLdProps): React.JSX.Element => {
  const data = compactObject([
    ["@context", "https://schema.org"],
    ["@type", type],
    ["@id", id],
    ["name", name],
    ["url", url],
    ["logo", logo],
    ["legalName", legalName],
    ["sameAs", sameAs],
    ["address", normalizeAddress(address)],
    ["contactPoint", normalizeContactPoints(contactPoint ?? contactPoints)],
    ...Object.entries(rest),
  ]);

  return <JsonLdScript data={data} id={scriptId} scriptKey="organization" keyOverride={keyOverride} />;
};

/** JSON-LD de negocio local compatible con una CSP estricta basada en nonce. */
export const LocalBusinessJsonLd = ({
  type = "LocalBusiness",
  id,
  address,
  geo,
  images,
  rating,
  review,
  openingHours,
  action,
  areaServed,
  makesOffer,
  scriptId,
  keyOverride,
  ...rest
}: LocalBusinessJsonLdProps): React.JSX.Element => {
  const data = compactObject([
    ["@context", "https://schema.org"],
    ["@type", type],
    ["@id", id],
    ...Object.entries(rest),
    ["image", images],
    ["address", normalizeAddress(address)],
    ["geo", normalizeGeo(geo)],
    ["aggregateRating", normalizeRating(rating)],
    ["review", normalizeReviews(review)],
    ["potentialAction", normalizeAction(action)],
    ["areaServed", normalizeAreaServed(areaServed)],
    ["makesOffer", normalizeOffers(makesOffer)],
    ["openingHoursSpecification", normalizeOpeningHours(openingHours)],
  ]);

  return <JsonLdScript data={data} id={scriptId} scriptKey="LocalBusiness" keyOverride={keyOverride} />;
};
