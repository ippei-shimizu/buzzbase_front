import AvailabilityBadge from "@app/components/pro/AvailabilityBadge";
import { PRO_PAYWALL_COPY } from "@app/components/pro/paywallCopy";
import {
  FEATURE_COMPARISONS,
  SHOWCASE_FEATURES,
} from "@app/components/pro/proFeatureCatalog";

const SHOWCASES = SHOWCASE_FEATURES.map((feature) => {
  const copy = PRO_PAYWALL_COPY[feature];
  return {
    feature,
    title: copy.title,
    // benefits を持たないキーに差し替えられても訴求が空にならないよう description へ落とす。
    points: copy.benefits ?? [copy.description],
    availability: FEATURE_COMPARISONS[feature].availability,
  };
});

export default function FeatureHighlights() {
  return (
    <section className="bg-[#2E2E2E] px-6 py-16 md:py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-10 text-center text-2xl font-bold text-white md:text-3xl">
          Pro で広がる体験
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {SHOWCASES.map((showcase) => (
            <article
              key={showcase.feature}
              className="rounded-2xl border border-gray-700 bg-[#424242] p-5"
            >
              <h3 className="mb-3 flex flex-wrap items-center gap-2 text-base font-bold text-white">
                {showcase.title}
                <AvailabilityBadge availability={showcase.availability} />
              </h3>
              <ul className="space-y-2 text-sm leading-relaxed text-gray-300">
                {showcase.points.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span className="text-[#d08000]">・</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
