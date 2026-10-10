import { CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { EvidenceCard } from '@/components/ui/evidence-card';
import type { ChecklistResponse } from '@/data/checklists';

export function ChecklistResponseRow({
  response,
  evidence = response.evidence ?? [],
}: {
  response: ChecklistResponse;
  evidence?: NonNullable<ChecklistResponse['evidence']>;
}) {
  const Icon = response.flagged ? WarningCircle : CheckCircle;

  return (
    <div id={`response-${response.id}`} className="grid min-w-0 gap-2 py-3 text-xs">
      <div className="flex min-w-0 items-start gap-2">
        <Icon
          size={18}
          className={`mt-0.5 shrink-0 ${response.flagged ? 'text-critical' : 'text-success'}`}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <h3 className="font-semibold text-deepCharcoal">
            {response.question}
          </h3>
          <p className="mt-1 break-words text-graphite">
            {response.type === 'checkbox' && <span aria-hidden="true">☑ </span>}
            {response.answer}
          </p>
        </div>
      </div>
      {response.note && (
        <p className="pl-[26px] leading-5 text-graphite">
          <span className="font-semibold text-deepCharcoal">Note:</span>{' '}
          {response.note}
        </p>
      )}
      {evidence.length ? (
        <div className="flex flex-wrap gap-2 pl-[26px]">
          {evidence.map((file) => (
            <div key={`${file.name}-${file.url}`} className="w-full max-w-[360px]">
              <EvidenceCard
                item={{ type: 'photo', url: file.url, caption: file.name }}
                compactUnavailable
              />
            </div>
          ))}
        </div>
      ) : response.type === 'photo' && !response.evidence?.length ? (
        <p className="pl-[26px] text-graphite/70">No evidence attached</p>
      ) : null}
    </div>
  );
}
