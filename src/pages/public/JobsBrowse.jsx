import { useNavigate, useSearchParams } from 'react-router-dom';
import { useServiceData } from '@/hooks/useServiceData';
import { JobService } from '@/services';
import { useLanguage } from '@/contexts/LanguageContext';
import Icon from '@/components/common/Icon';
import JobTicket from '@/components/job/JobTicket';
import FilterChips from '@/components/common/FilterChips';
import EmptyState from '@/components/common/EmptyState';
import { PageSkeleton } from '@/components/common/Skeleton';
import { TRADES, CITIES } from '@/data/companies';

export default function JobsBrowse() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [params, setParams] = useSearchParams();

  const filters = {
    q: params.get('q') || '',
    trade: params.get('trade') || '',
    city: params.get('city') || '',
  };
  const hasActiveFilters = !!(filters.q || filters.trade || filters.city);

  // Replace, not push — typing/tapping a filter shouldn't flood browser history.
  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };
  const clearFilters = () => setParams({}, { replace: true });

  const { data: jobs, loading } = useServiceData(() => JobService.search(filters), [params.toString()]);

  if (loading) return <div className="section"><PageSkeleton stats={false} /></div>;

  return (
    <section className="section">
      <div className="section-head"><h2>{t('search.jobsHeading')}</h2></div>

      <div className="search-bar">
        <Icon name="search" size={16} color="var(--text-mute)" />
        <input
          value={filters.q}
          onChange={(e) => updateParam('q', e.target.value)}
          placeholder={t('search.jobsPlaceholder')}
        />
      </div>

      <FilterChips options={TRADES} selected={filters.trade || null} onSelect={(v) => updateParam('trade', v)} />
      <FilterChips options={CITIES} selected={filters.city || null} onSelect={(v) => updateParam('city', v)} />

      {jobs.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState icon="search" title={t('search.noResultsTitle')} hint={t('search.noResultsHint')} actionLabel={t('search.clearFilters')} onAction={clearFilters} />
        ) : (
          <EmptyState icon="briefcase" title={t('search.noJobsTitle')} hint={t('search.noJobsHint')} actionLabel={t('common.register')} onAction={() => navigate('/register')} />
        )
      ) : (
        <>
          <div className="search-result-count">
            {t(jobs.length === 1 ? 'search.resultsCountOne' : 'search.resultsCountOther', { count: jobs.length })}
          </div>
          <div className="ticket-grid">
            {jobs.map((j) => <JobTicket key={j.id} job={j} onApply={() => navigate(`/jobs/${j.id}`)} />)}
          </div>
        </>
      )}
    </section>
  );
}
