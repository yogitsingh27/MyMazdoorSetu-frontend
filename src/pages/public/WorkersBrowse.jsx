import { useNavigate, useSearchParams } from 'react-router-dom';
import { useServiceData } from '@/hooks/useServiceData';
import { WorkerService } from '@/services';
import { useLanguage } from '@/contexts/LanguageContext';
import Icon from '@/components/common/Icon';
import WorkerShowcaseCard from '@/components/landing/WorkerShowcaseCard';
import FilterChips from '@/components/common/FilterChips';
import EmptyState from '@/components/common/EmptyState';
import { PageSkeleton } from '@/components/common/Skeleton';
import { TRADES, CITIES } from '@/data/companies';
import { cn } from '@/utils/cn';

export default function WorkersBrowse() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [params, setParams] = useSearchParams();

  const filters = {
    q: params.get('q') || '',
    trade: params.get('trade') || '',
    city: params.get('city') || '',
    availability: params.get('availability') || '',
    verifiedOnly: params.get('verified') === '1',
  };
  const hasActiveFilters = !!(filters.q || filters.trade || filters.city || filters.availability || filters.verifiedOnly);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };
  const clearFilters = () => setParams({}, { replace: true });

  const { data: workers, loading } = useServiceData(() => WorkerService.search(filters), [params.toString()]);

  if (loading) return <div className="section"><PageSkeleton stats={false} /></div>;

  return (
    <section className="section">
      <div className="section-head">
        <h2>{t('search.workersHeading')}</h2>
        <p className="section-desc">{t('search.workersDesc')}</p>
      </div>

      <div className="search-bar">
        <Icon name="search" size={16} color="var(--text-mute)" />
        <input
          value={filters.q}
          onChange={(e) => updateParam('q', e.target.value)}
          placeholder={t('search.workersPlaceholder')}
        />
      </div>

      <FilterChips options={TRADES} selected={filters.trade || null} onSelect={(v) => updateParam('trade', v)} />
      <FilterChips options={CITIES} selected={filters.city || null} onSelect={(v) => updateParam('city', v)} />

      <div className="filter-chips">
        <button
          type="button"
          className={cn('filter-chip filter-toggle', filters.availability === 'available' && 'active')}
          aria-pressed={filters.availability === 'available'}
          onClick={() => updateParam('availability', filters.availability === 'available' ? '' : 'available')}
        >
          {t('search.availableNow')}
        </button>
        <button
          type="button"
          className={cn('filter-chip filter-toggle', filters.verifiedOnly && 'active')}
          aria-pressed={filters.verifiedOnly}
          onClick={() => updateParam('verified', filters.verifiedOnly ? '' : '1')}
        >
          {t('search.verifiedOnly')}
        </button>
      </div>

      {workers.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState icon="search" title={t('search.noResultsTitle')} hint={t('search.noResultsHint')} actionLabel={t('search.clearFilters')} onAction={clearFilters} />
        ) : (
          <EmptyState icon="users" title={t('search.noWorkersTitle')} hint={t('search.noWorkersHint')} />
        )
      ) : (
        <>
          <div className="search-result-count">
            {t(workers.length === 1 ? 'search.resultsCountOne' : 'search.resultsCountOther', { count: workers.length })}
          </div>
          <div className="showcase-grid">
            {workers.map((w) => <WorkerShowcaseCard key={w.id} worker={w} onClick={() => navigate(`/workers/${w.id}`)} />)}
          </div>
        </>
      )}

      <div className="browse-banner">
        <p>{t('search.wantToContact')}</p>
        <div className="browse-banner-ctas">
          <button className="btn btn-primary" onClick={() => navigate('/register')}>{t('common.register')}</button>
          <button className="btn btn-outline" onClick={() => navigate('/login')}>{t('common.logIn')}</button>
        </div>
      </div>
    </section>
  );
}
