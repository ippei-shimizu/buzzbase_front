import AvailabilityBadge from "@app/components/pro/AvailabilityBadge";
import { PRO_PAYWALL_COPY } from "@app/components/pro/paywallCopy";
import {
  FEATURE_COMPARISONS,
  FEATURE_GROUPS,
} from "@app/components/pro/proFeatureCatalog";

export default function FeatureComparisonTable() {
  return (
    <section
      id="feature-comparison"
      className="bg-[#262626] px-6 py-16 md:py-20"
    >
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-2 text-center text-2xl font-bold text-white md:text-3xl">
          Free と Pro の違い
        </h2>
        <p className="mb-10 text-center text-sm leading-relaxed text-gray-400">
          Pro
          で解放されるすべての機能と、無料プランでの上限を掲載しています。「アプリ版」と付いた機能は、現在アプリ版でのみご利用いただけます。
        </p>

        <div className="space-y-8">
          {FEATURE_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="mb-2 text-sm font-bold text-[#d08000]">
                {group.title}
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-gray-700">
                <table className="w-full text-sm text-gray-200">
                  <caption className="sr-only">
                    {group.title}の Free と Pro の比較
                  </caption>
                  <thead className="bg-[#424242]">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left font-semibold"
                      >
                        機能
                      </th>
                      <th
                        scope="col"
                        className="w-24 px-4 py-3 text-center font-semibold text-gray-400"
                      >
                        Free
                      </th>
                      <th
                        scope="col"
                        className="w-24 px-4 py-3 text-center font-semibold text-[#d08000]"
                      >
                        Pro
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.keys.map((key) => (
                      <tr key={key} className="border-t border-gray-700">
                        <th
                          scope="row"
                          className="px-4 py-3 text-left font-normal"
                        >
                          <span className="flex flex-wrap items-center gap-1.5">
                            {PRO_PAYWALL_COPY[key].title}
                            <AvailabilityBadge
                              availability={
                                FEATURE_COMPARISONS[key].availability
                              }
                            />
                          </span>
                        </th>
                        <td className="px-4 py-3 text-center text-gray-400">
                          {FEATURE_COMPARISONS[key].free}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-white">
                          {FEATURE_COMPARISONS[key].pro}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
