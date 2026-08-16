import { useEffect, useRef, useState } from 'react';
import { launchCampaign } from './campaignCommand';
import { fetchCampaignById, type Campaign, type CampaignDetail } from './campaigns';
import { saveTechnicalAssignmentDraft, fetchTechnicalAssignmentById, type TechnicalAssignment } from './technicalAssignmentApi';
import { PROPERTY_FIELDS, TENANT_REQUEST_FIELDS, FIELD_GROUPS, fieldsForScenario, type TAFieldDef } from './technicalAssignmentFields';
import {
  parseDecimalInput,
  formatDecimalForDisplay,
  resolveBooleanChoice,
  booleanChoiceFromValue,
  computeMissingRequiredFields,
  isReadyForAnalysis,
  computeTotalRentFromRate,
  computeRatePerSqmFromTotal,
  formatThousands,
  addStringArrayToken,
  removeStringArrayToken,
  splitStringArrayInput,
  hydrateDecimalState
} from './technicalAssignmentFormLogic';
import {
  getTechnicalAssignmentIdFromSearch,
  buildSearchWithTechnicalAssignmentId,
  buildSearchWithoutTechnicalAssignmentId
} from './technicalAssignmentUrlState';
import {
  getCampaignIdFromSearch,
  buildSearchWithCampaignId,
  buildSearchWithoutCampaignId,
  isLikelyCampaignId,
  campaignRestoreTakesPriority
} from './campaignUrlState';
import {
  BUSINESS_CATEGORY_LABELS,
  CAMPAIGN_OUTCOME_CODE_LABELS,
  CAMPAIGN_STATUS_LABELS,
  LIFECYCLE_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
  SCENARIO_LABELS,
  ruLabel
} from './ruLabels';
import { explainTechnicalAssignmentError, explainMissingRequiredField } from './technicalAssignmentErrorMessages';
import {
  createPreLaunchAnalysisSnapshot,
  createPostLaunchRefreshRetry,
  fetchCurrentPreLaunchAnalysisSnapshot,
  fetchCurrentPostLaunchRefreshAnalysisSnapshot,
  type AnalysisApiFailure,
  type AnalysisMetric,
  type AnalysisResults,
  type AnalysisSnapshot
} from './analysisSnapshotApi';

// Visible end-to-end product scenario (Sprint 4): goal selection -> real
// Technical Assignment form -> Analysis (gated on ready_for_analysis) ->
// Contacts (synthetic fixture only) -> launch -> success -> Campaign
// detail. Sequence and field composition are normative per
// 02_PRODUCT/CAMPAIGN_TECHNICAL_ASSIGNMENT.md section 3.1 / 7-8; no new
// business fields, statuses or copy are invented here. Field labels are
// UI-only sugar over the raw field_id (see technicalAssignmentFields.ts) --
// the API and stored data still key everything by field_id.

type Goal = 'owner' | 'tenant';
type Step = 'goal' | 'ta' | 'analysis' | 'contacts' | 'launch' | 'success' | 'detail';

// Fixed, explicitly-marked synthetic fixture -- never an editable field, so
// there is no way for this screen to collect or transmit a real contact.
const SYNTHETIC_CONTACT_FIXTURE = {
  name: 'Синтетический тестовый контакт',
  phone: '+0-000-000-0000',
  email: 'synthetic.contact@example.test'
};

interface DecimalFieldState {
  rawText: string;
  invalid: boolean;
  touched: boolean;
}

interface AnalysisCommandState {
  technicalAssignmentId: string;
  revision: number;
  idempotencyKey: string;
  retryOfAnalysisSnapshotId: string | null;
}

interface PostLaunchRetryCommandState {
  idempotencyKey: string;
  retryOfAnalysisSnapshotId: string;
}

const CONFIDENCE_LABELS: Record<string, string> = {
  low: 'низкая',
  medium: 'средняя',
  high: 'высокая'
};

const PRICE_CLASSIFICATION_LABELS: Record<string, string> = {
  below_reference_range: 'ниже диапазона сопоставимой выборки',
  within_reference_range: 'в диапазоне сопоставимой выборки',
  above_reference_range: 'выше диапазона сопоставимой выборки'
};

function analysisMatchesAssignment(snapshot: AnalysisSnapshot | null, assignment: TechnicalAssignment | null): boolean {
  return Boolean(
    snapshot
      && assignment
      && snapshot.analysis_kind === 'pre_launch'
      && snapshot.technical_assignment_id === assignment.technical_assignment_id
      && snapshot.source_revision === assignment.revision
      && snapshot.scenario === assignment.scenario
  );
}

function analysisAllowsProgress(snapshot: AnalysisSnapshot | null, assignment: TechnicalAssignment | null): boolean {
  return analysisMatchesAssignment(snapshot, assignment)
    && snapshot?.freshness_status === 'current'
    && Boolean(snapshot.results)
    && (snapshot.status === 'completed' || snapshot.status === 'insufficient_data');
}

function analysisFailureMessage(error: AnalysisApiFailure): string {
  switch (error.code) {
    case 'ANALYSIS_TECHNICAL_ASSIGNMENT_NOT_FOUND':
      return 'Техническое задание не найдено. Вернитесь назад и восстановите его из сохранённой ссылки.';
    case 'ANALYSIS_TECHNICAL_ASSIGNMENT_NOT_READY':
      return 'Техническое задание ещё не готово к анализу.';
    case 'ANALYSIS_REVISION_CONFLICT':
      return 'Техническое задание изменилось. Откройте анализ для текущей версии.';
    case 'ANALYSIS_DATASET_UNAVAILABLE':
      return 'Доказательная база анализа временно недоступна. Попробуйте ещё раз.';
    case 'ANALYSIS_GENERATION_FAILED':
      return 'Расчёт завершился технической ошибкой. Попробуйте ещё раз.';
    case 'ANALYSIS_IDEMPOTENCY_CONFLICT':
      return 'Запрос анализа устарел. Обновите страницу и повторите действие.';
    case 'ANALYSIS_RETRY_NOT_ALLOWED':
    case 'ANALYSIS_RETRY_TARGET_MISMATCH':
      return 'Повтор для этой версии анализа уже недоступен. Обновите текущий результат.';
    default:
      return 'Не удалось получить предварительный анализ. Попробуйте ещё раз.';
  }
}

function analysisFreshnessMessage(snapshot: AnalysisSnapshot): string {
  if (snapshot.freshness_reason === 'evidence_revoked') {
    return 'Доказательная база этого расчёта отозвана. Результат больше не считается актуальным и не разрешает запуск кампании.';
  }
  return 'Техническое задание изменилось. Обновите анализ для текущей версии.';
}

// H2 corrective pass: pre-launch's analysisFreshnessMessage above correctly
// warns that a stale result does not authorize launch (PRODUCT §4/§11.3) --
// but that warning is misleading on the post-launch Campaign detail screen,
// where the Campaign has already launched and stale only means the
// post_launch_refresh result itself is outdated. This never surfaces the
// internal evidence_revocation_reason_code, revocation actor/timestamp or
// any raw payload (PRODUCT §6.4) -- only the public freshness_reason, same
// as analysisFreshnessMessage.
function postLaunchFreshnessMessage(snapshot: AnalysisSnapshot): string {
  const reason = snapshot.freshness_reason === 'evidence_revoked'
    ? 'Доказательная база этого расчёта отозвана.'
    : 'Техническое задание изменилось.';
  return `${reason} Результат анализа после запуска больше не актуален, требуется новый анализ. Статус уже запущенной кампании не изменился.`;
}

function metricExplanation(metric: AnalysisMetric): string {
  if (metric.reason_codes.includes('REFERENCE_SAMPLE_TOO_SMALL')) {
    return 'Для надёжного сравнения цены нужно не менее пяти сопоставимых записей.';
  }
  if (metric.reason_codes.includes('NO_COMPATIBLE_SYNTHETIC_RECORDS')) {
    return 'В синтетической базе пока нет сопоставимых записей для этого вывода.';
  }
  return 'Подтверждённых данных для надёжного вывода пока недостаточно.';
}

function MetricContext({ metric }: { metric: AnalysisMetric }) {
  return (
    <p>
      Размер выборки: {metric.sample_size}. Уверенность:{' '}
      {metric.confidence ? CONFIDENCE_LABELS[metric.confidence] : 'не определяется'}.
      {metric.assumptions.includes('UNSUPPORTED_FILTERS_PRESENT')
        ? ' Часть дополнительных условий пока не участвует в сравнении.'
        : ''}
    </p>
  );
}

function formatRate(value: string): string {
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parsed)
    : value;
}

function formatAnalysisTime(value: string | null): string {
  if (!value) return 'расчёт ещё не завершён';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString('ru-RU');
}

// PRODUCT §15.1/§15.3: pre-launch and post-launch screens present the same
// four approved analytical blocks, in the same order, with the same
// synthetic-only marker and never a deal-probability number/range/word --
// shared here once instead of duplicated per screen.
const SYNTHETIC_DATA_MARKER = 'По синтетической базе LeaseMind';

const POST_LAUNCH_STATUS_LABELS: Record<AnalysisSnapshot['status'], string> = {
  pending: 'выполняется',
  completed: 'завершён',
  insufficient_data: 'завершён (недостаточно данных)',
  failed: 'ошибка'
};

function AnalysisResultBlocks({ results, scenario }: { results: AnalysisResults; scenario: 'need_tenant' | 'need_property' }) {
  const priceMetric = results.price_adequacy;
  const competitionMetric = results.competition;
  const probabilityMetric = results.deal_probability_30d;
  const categoriesMetric = results.candidate_categories;
  const categoryLabels = categoriesMetric.value?.category_kind === 'tenant_business_category'
    ? BUSINESS_CATEGORY_LABELS
    : PROPERTY_TYPE_LABELS;

  return (
    <>
      <section aria-labelledby="analysis-price-heading">
        <h3 id="analysis-price-heading">1. Адекватность арендной ставки</h3>
        {priceMetric.metric_status === 'assessed' && priceMetric.value ? (
          <>
            <p>
              Указанная ставка: {formatRate(priceMetric.value.subject_rate_rub_per_sqm_month)} ₽/м²/мес.
              Сопоставимый диапазон: {formatRate(priceMetric.value.p25_rub_per_sqm_month)}–{formatRate(priceMetric.value.p75_rub_per_sqm_month)} ₽/м²/мес,
              медиана — {formatRate(priceMetric.value.median_rub_per_sqm_month)} ₽/м²/мес.
            </p>
            <p>Вывод: {ruLabel(PRICE_CLASSIFICATION_LABELS, priceMetric.value.classification)}.</p>
          </>
        ) : (
          <p>{metricExplanation(priceMetric)}</p>
        )}
        <MetricContext metric={priceMetric} />
      </section>

      <section aria-labelledby="analysis-competition-heading">
        <h3 id="analysis-competition-heading">2. Конкурентная среда</h3>
        {competitionMetric.metric_status === 'assessed' && competitionMetric.value ? (
          <p>
            Найдено сопоставимых записей: {competitionMetric.value.comparable_count} из {competitionMetric.value.population_scanned} просмотренных.
          </p>
        ) : (
          <p>{metricExplanation(competitionMetric)}</p>
        )}
        <MetricContext metric={competitionMetric} />
      </section>

      <section aria-labelledby="analysis-probability-heading">
        <h3 id="analysis-probability-heading">3. Вероятность сделки за 30 дней</h3>
        <p>Недостаточно подтверждённой истории исходов для обоснованной оценки за 30 дней.</p>
        <MetricContext metric={probabilityMetric} />
      </section>

      <section aria-labelledby="analysis-categories-heading">
        <h3 id="analysis-categories-heading">
          4. {scenario === 'need_tenant' ? 'Потенциальные категории арендаторов' : 'Потенциальные типы помещений'}
        </h3>
        {categoriesMetric.metric_status === 'assessed' && categoriesMetric.value ? (
          <ul>
            {categoriesMetric.value.items.map(item => (
              <li key={item.code}>
                {ruLabel(categoryLabels, item.code)} — сопоставимых записей: {item.compatible_count}
              </li>
            ))}
          </ul>
        ) : (
          <p>{metricExplanation(categoriesMetric)}</p>
        )}
        <MetricContext metric={categoriesMetric} />
      </section>

      <p>Предварительный анализ основан только на синтетических данных и не является прогнозом результата конкретной кампании.</p>
      <p>Анализ носит информационный характер и не является юридической или финансовой рекомендацией. Решения по сделке принимает пользователь.</p>
    </>
  );
}

interface RenderFieldContext {
  values: Record<string, unknown>;
  onChange: (fieldId: string, value: unknown) => void;
  decimalState: Record<string, DecimalFieldState>;
  onDecimalChange: (field: TAFieldDef, rawText: string) => void;
  onDecimalBlur: (field: TAFieldDef) => void;
  stringArrayDraft: Record<string, string>;
  onStringArrayInputChange: (field: TAFieldDef, rawText: string) => void;
  onStringArrayCommit: (field: TAFieldDef) => void;
  onStringArrayRemove: (field: TAFieldDef, value: string) => void;
}

function renderField(field: TAFieldDef, ctx: RenderFieldContext) {
  const value = ctx.values[field.fieldId];
  switch (field.kind) {
    case 'enum':
      return (
        <select value={(value as string) ?? ''} onChange={e => ctx.onChange(field.fieldId, e.target.value || undefined)}>
          <option value="">-- выберите --</option>
          {field.options?.map(opt => (
            <option key={opt} value={opt}>
              {field.optionLabels?.[opt] ?? opt}
            </option>
          ))}
        </select>
      );
    case 'enum_array': {
      const arr = (value as string[] | undefined) ?? [];
      return (
        <span>
          {field.options?.map(opt => (
            <label key={opt} style={{ marginRight: '0.5em' }}>
              <input
                type="checkbox"
                checked={arr.includes(opt)}
                onChange={e => {
                  const next = e.target.checked ? [...arr, opt] : arr.filter(v => v !== opt);
                  ctx.onChange(field.fieldId, next);
                }}
              />
              {field.optionLabels?.[opt] ?? opt}
            </label>
          ))}
        </span>
      );
    }
    case 'string':
      return <input type="text" value={(value as string) ?? ''} onChange={e => ctx.onChange(field.fieldId, e.target.value || undefined)} />;
    case 'string_array': {
      const arr = (value as string[] | undefined) ?? [];
      const draft = ctx.stringArrayDraft[field.fieldId] ?? '';
      return (
        <span>
          {arr.map(item => (
            <span
              key={item}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                marginRight: '0.4em',
                marginBottom: '0.25em',
                padding: '0 0.4em',
                border: '1px solid #ccc',
                borderRadius: '0.25em'
              }}
            >
              {item}
              <button
                type="button"
                aria-label={`Удалить «${item}»`}
                onClick={() => ctx.onStringArrayRemove(field, item)}
                style={{ marginLeft: '0.3em', border: 'none', background: 'none', cursor: 'pointer' }}
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            value={draft}
            placeholder="Введите значение и нажмите Enter или запятую"
            onChange={e => ctx.onStringArrayInputChange(field, e.target.value)}
            onKeyDown={e => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              ctx.onStringArrayCommit(field);
            }}
            onBlur={() => ctx.onStringArrayCommit(field)}
          />
        </span>
      );
    }
    case 'integer':
      return (
        <input
          type="number"
          value={value === undefined || value === null ? '' : (value as number)}
          onChange={e => ctx.onChange(field.fieldId, e.target.value === '' ? undefined : Number(e.target.value))}
        />
      );
    case 'decimal': {
      const state = ctx.decimalState[field.fieldId] ?? { rawText: '', invalid: false, touched: false };
      const showError = state.touched && state.invalid && state.rawText.trim() !== '';
      return (
        <span>
          <input
            type="text"
            inputMode="decimal"
            value={state.rawText}
            onChange={e => ctx.onDecimalChange(field, e.target.value)}
            onBlur={() => ctx.onDecimalBlur(field)}
            aria-invalid={showError}
          />
          {showError && field.decimalErrorHint && (
            <span role="alert" style={{ color: '#b00020', marginLeft: '0.5em' }}>
              {field.decimalErrorHint}
            </span>
          )}
        </span>
      );
    }
    case 'boolean': {
      const choice = booleanChoiceFromValue(value);
      return (
        <span role="radiogroup" aria-label={field.label}>
          <label style={{ marginRight: '1em' }}>
            <input
              type="radio"
              name={`ta-bool-${field.fieldId}`}
              checked={choice === 'yes'}
              onChange={() => ctx.onChange(field.fieldId, resolveBooleanChoice('yes'))}
            />{' '}
            Да
          </label>
          <label>
            <input
              type="radio"
              name={`ta-bool-${field.fieldId}`}
              checked={choice === 'no'}
              onChange={() => ctx.onChange(field.fieldId, resolveBooleanChoice('no'))}
            />{' '}
            Нет
          </label>
          {choice === null && <em style={{ marginLeft: '0.5em' }}>Не выбрано</em>}
        </span>
      );
    }
    case 'date':
      return <input type="date" value={(value as string) ?? ''} onChange={e => ctx.onChange(field.fieldId, e.target.value || undefined)} />;
    case 'free_text':
      return <textarea value={(value as string) ?? ''} onChange={e => ctx.onChange(field.fieldId, e.target.value || undefined)} />;
    default:
      return null;
  }
}

// Shared rate/total entry UI. For Property the rate remains a UI-only helper
// because the object's area is fixed. For TenantRequest the maximum rate is
// also persisted as its own hard constraint, while the required total budget
// is derived from the maximum requested area (ADR-0008 section 1.2).
const RENT_RATE_LIMITS = { min: 1, max: 100000000, decimals: 2 };
const REQUEST_RENT_RATE_FIELD_ID = 'request_monthly_rent_rate_max_rub_per_sqm';

type RentMode = 'rate' | 'total';

interface RentFieldProps {
  context: 'property' | 'request';
  mode: RentMode;
  onModeChange: (mode: RentMode) => void;
  totalValue: number | undefined;
  onTotalChange: (value: number | undefined) => void;
  areaSqm: number | undefined;
  rateText: string;
  rateInvalid: boolean;
  rateTouched: boolean;
  onRateChange: (text: string) => void;
  onRateBlur: () => void;
}

function RentField(props: RentFieldProps) {
  const { context, mode, onModeChange, totalValue, onTotalChange, areaSqm, rateText, rateInvalid, rateTouched, onRateChange, onRateBlur } = props;
  const isRequest = context === 'request';
  const hasArea = typeof areaSqm === 'number';
  const showRateError = rateTouched && rateInvalid && rateText.trim() !== '';

  return (
    <span>
      <span style={{ display: 'block', marginBottom: '0.25em' }}>
        <label style={{ marginRight: '1em' }}>
          <input type="radio" name={`ta-${context}-rent-mode`} checked={mode === 'rate'} onChange={() => onModeChange('rate')} /> Ставка за м²
        </label>
        <label>
          <input type="radio" name={`ta-${context}-rent-mode`} checked={mode === 'total'} onChange={() => onModeChange('total')} /> {isRequest ? 'Общий бюджет' : 'Общая сумма'}
        </label>
      </span>
      {mode === 'rate' ? (
        <span>
          <label>
            {isRequest ? 'Максимальная ставка аренды' : 'Ставка аренды'}, ₽/м²/мес{' '}
            <input
              type="text"
              inputMode="decimal"
              value={rateText}
              onChange={e => onRateChange(e.target.value)}
              onBlur={onRateBlur}
              aria-invalid={showRateError}
            />
          </label>
          {showRateError && (
            <span role="alert" style={{ color: '#b00020', marginLeft: '0.5em' }}>
              Введите ставку в рублях за м², например 4000
            </span>
          )}
          <p>{isRequest ? 'Вы указали максимальную ставку' : 'Вы указали ставку'}</p>
          {hasArea && typeof totalValue === 'number' ? (
            <p>
              {isRequest ? 'Расчётный максимальный общий бюджет' : 'Расчётная общая аренда'}: ≈ {formatThousands(totalValue)} ₽/мес за{' '}
              {isRequest ? 'максимальные ' : ''}{formatDecimalForDisplay(areaSqm as number)} м²
            </p>
          ) : (
            !hasArea && <p>Укажите {isRequest ? 'максимальную площадь' : 'площадь'}, чтобы увидеть расчётную общую сумму.</p>
          )}
        </span>
      ) : (
        <span>
          <label>
            {isRequest ? 'Максимальный общий бюджет' : 'Общая аренда'}, ₽/мес{' '}
            <input
              type="number"
              value={totalValue === undefined ? '' : totalValue}
              onChange={e => onTotalChange(e.target.value === '' ? undefined : Number(e.target.value))}
            />
          </label>
          <p>{isRequest ? 'Вы указали максимальный общий бюджет' : 'Вы указали общую сумму'}</p>
          {hasArea && typeof totalValue === 'number' ? (
            <p>Расчётная ставка{isRequest ? ' по максимальной площади' : ''}: ≈ {formatThousands(computeRatePerSqmFromTotal(totalValue, areaSqm as number))} ₽/м²/мес</p>
          ) : (
            !hasArea && <p>Укажите {isRequest ? 'максимальную площадь' : 'площадь'}, чтобы увидеть расчётную ставку.</p>
          )}
        </span>
      )}
    </span>
  );
}

export default function CampaignLaunchWizard() {
  const [step, setStep] = useState<Step>('goal');
  const [goal, setGoal] = useState<Goal | null>(null);
  const [taIdempotencyKey] = useState(() => crypto.randomUUID());
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [decimalState, setDecimalState] = useState<Record<string, DecimalFieldState>>({});
  const [stringArrayDraft, setStringArrayDraft] = useState<Record<string, string>>({});
  const [rentMode, setRentMode] = useState<RentMode>('total');
  const [rentRateText, setRentRateText] = useState('');
  const [rentRateInvalid, setRentRateInvalid] = useState(false);
  const [rentRateTouched, setRentRateTouched] = useState(false);
  const [requestBudgetMode, setRequestBudgetMode] = useState<RentMode>('total');
  const [requestRentRateText, setRequestRentRateText] = useState('');
  const [requestRentRateInvalid, setRequestRentRateInvalid] = useState(false);
  const [requestRentRateTouched, setRequestRentRateTouched] = useState(false);
  const [assignment, setAssignment] = useState<TechnicalAssignment | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveErrorHighlightFieldIds, setSaveErrorHighlightFieldIds] = useState<string[]>([]);
  const [missingFields, setMissingFields] = useState<TAFieldDef[]>([]);

  const [analysisSnapshot, setAnalysisSnapshot] = useState<AnalysisSnapshot | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisReloadAttempt, setAnalysisReloadAttempt] = useState(0);
  const analysisCommandRef = useRef<AnalysisCommandState | null>(null);
  // Synchronous guard against a second click landing before the passive
  // effect (and its setAnalysisLoading(true)) has run -- state updates are
  // not visible synchronously, so only a ref read/write at the top of the
  // click handler can close that window. See handleAnalysisRetry below.
  const analysisRetryInFlightRef = useRef(false);

  const [launchIdempotencyKey, setLaunchIdempotencyKey] = useState(() => crypto.randomUUID());
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [wasReplay, setWasReplay] = useState(false);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [detailCampaignId, setDetailCampaignId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CampaignDetail | null>(null);
  const [detailError, setDetailError] = useState(false);
  const [detailReloadAttempt, setDetailReloadAttempt] = useState(0);

  // PRODUCT §15.3: post-launch Analysis on the Campaign detail screen.
  // Read-only (GET current) plus explicit-retry-only -- there is no
  // "create initial attempt" path here at all; the durable worker owns
  // that exclusively (ADR-0009 §10).
  const [postLaunchSnapshot, setPostLaunchSnapshot] = useState<AnalysisSnapshot | null>(null);
  const [postLaunchLoading, setPostLaunchLoading] = useState(false);
  const [postLaunchError, setPostLaunchError] = useState<string | null>(null);
  const [postLaunchReloadAttempt, setPostLaunchReloadAttempt] = useState(0);
  const postLaunchCommandRef = useRef<PostLaunchRetryCommandState | null>(null);
  // Same synchronous double-click guard as analysisRetryInFlightRef above.
  const postLaunchRetryInFlightRef = useRef(false);

  // Defect 1 (Sprint 4): reload / return-to-old-tab restore. `ta` in the URL
  // query string is the only navigation state kept client-side -- never the
  // payload, never localStorage/sessionStorage. `restoring` starts true
  // whenever the URL already carries a `ta` id, so the goal-selection screen
  // never flashes before the restore GET resolves. `hasUnsavedChanges` backs
  // a beforeunload warning: edits since the last successful "Сохранить" are,
  // by the existing save contract (ADR-0008 section 1, an explicit,
  // idempotency-keyed save command -- no debounced/interval autosave is
  // specified anywhere in the approved contract), only ever persisted when
  // the user explicitly saves; this at least keeps that loss from being
  // silent, without inventing a new autosave endpoint/behavior.
  const [restoring, setRestoring] = useState(() =>
    Boolean(getTechnicalAssignmentIdFromSearch(window.location.search))
    && !campaignRestoreTakesPriority(window.location.search)
  );
  const [restoreNotice, setRestoreNotice] = useState<string | null>(null);
  const [restoreFailed, setRestoreFailed] = useState(false);
  const [restoreAttempt, setRestoreAttempt] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Defect 2 (Sprint 4): the Contacts screen previously let "Далее" through
  // unconditionally. This is the explicit, required gating action ADR-0008
  // section 2 assumes the frontend makes ("фронтенд лишь решает, когда
  // отправить этот маркер") -- until it is checked, "Далее" stays disabled.
  const [contactsGateConfirmed, setContactsGateConfirmed] = useState(false);

  const fields = goal === 'owner' ? PROPERTY_FIELDS : TENANT_REQUEST_FIELDS;
  const scenario = goal === 'owner' ? ('need_tenant' as const) : ('need_property' as const);

  // Scroll to the first still-missing required field whenever a save leaves
  // the draft with a fresh list of gaps -- the alert text alone is not
  // enough to find the field in a long, grouped form.
  useEffect(() => {
    if (missingFields.length === 0) return;
    const el = document.getElementById(`ta-field-${missingFields[0].fieldId}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [missingFields]);

  // Same idea for a rejected save (cross-field conflict, invalid value,
  // etc.) -- scroll to the field the error is actually about.
  useEffect(() => {
    if (saveErrorHighlightFieldIds.length === 0) return;
    const el = document.getElementById(`ta-field-${saveErrorHighlightFieldIds[0]}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [saveErrorHighlightFieldIds]);

  // Restore-on-mount: re-fetch the Technical Assignment named by the URL
  // (not trusted client state) and open the one step its server-owned
  // lifecycle_status implies -- 'ta', pre-filled, for both draft and
  // ready_for_analysis (Analysis/Contacts/Launch are transient waypoints
  // beyond the TA itself, not separately persisted; the user can just press
  // "Далее (Анализ)" again, which no longer means re-typing anything).
  useEffect(() => {
    const id = getTechnicalAssignmentIdFromSearch(window.location.search);
    // A well-formed, supported `campaign` id in the URL takes priority --
    // launching strips `ta` and writes `campaign` (see handleLaunch), so
    // both present at once only happens for a stale bookmark; the Campaign
    // detail restore below owns that case instead of racing with this one.
    // A malformed/unsupported `campaign` value must NOT block `ta` restore
    // -- it never becomes trusted state (Campaign detail restore strips it
    // from the URL on its own), so restoring the Technical Assignment must
    // proceed exactly as if `campaign` had never been present.
    if (!id || campaignRestoreTakesPriority(window.location.search)) return;
    let cancelled = false;
    setRestoring(true);
    setRestoreFailed(false);
    setRestoreNotice(null);
    fetchTechnicalAssignmentById(id).then(result => {
      if (cancelled) return;
      setRestoring(false);
      if (result.kind === 'error') {
        setRestoreFailed(true);
        setRestoreNotice('Не удалось восстановить Техническое задание: сервис временно недоступен. Ссылка сохранена — попробуйте ещё раз.');
        return;
      }
      if (result.kind === 'not_found') {
        setRestoreNotice('Черновик с этим идентификатором не найден. Возможно, ссылка устарела.');
        const nextSearch = buildSearchWithoutTechnicalAssignmentId(window.location.search);
        window.history.replaceState(null, '', `${window.location.pathname}${nextSearch}`);
        return;
      }
      const found = result.assignment;
      const restoredFields = fieldsForScenario(found.scenario);
      setGoal(found.scenario === 'need_tenant' ? 'owner' : 'tenant');
      setAssignment(found);
      setAnalysisSnapshot(null);
      setAnalysisError(null);
      analysisCommandRef.current = null;
      setContactsGateConfirmed(false);
      setLaunchIdempotencyKey(crypto.randomUUID());
      setFormValues({ ...found.payload });
      setDecimalState(hydrateDecimalState(restoredFields, found.payload));
      const restoredRequestRate = found.payload[REQUEST_RENT_RATE_FIELD_ID];
      setRequestBudgetMode(typeof restoredRequestRate === 'number' ? 'rate' : 'total');
      setRequestRentRateText(typeof restoredRequestRate === 'number' ? formatDecimalForDisplay(restoredRequestRate) : '');
      setRequestRentRateInvalid(false);
      setRequestRentRateTouched(false);
      setMissingFields(isReadyForAnalysis(found.lifecycle_status) ? [] : computeMissingRequiredFields(restoredFields, found.payload));
      setHasUnsavedChanges(false);
      setStep('ta');
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restoreAttempt]);

  // Campaign detail restore-on-mount (PRODUCT §15.3, mirrors the Technical
  // Assignment restore above): `campaign` in the URL is the only navigation
  // state kept client-side for this screen -- never localStorage/
  // sessionStorage, never the Campaign/Analysis content itself. A malformed
  // or forbidden-version id is never trusted enough to open 'detail' or
  // attempt a fetch -- it is stripped from the URL instead, exactly like an
  // unresolved `ta` id already is above (and, unlike a valid one, never
  // suppresses `ta` restore -- see campaignRestoreTakesPriority above).
  useEffect(() => {
    const id = getCampaignIdFromSearch(window.location.search);
    if (!id) return;
    if (!isLikelyCampaignId(id)) {
      const nextSearch = buildSearchWithoutCampaignId(window.location.search);
      window.history.replaceState(null, '', `${window.location.pathname}${nextSearch}`);
      return;
    }
    // A valid Campaign id always wins over a `ta` restore in progress --
    // explicitly closes out `restoring` here too (not just via the initial
    // state above) so accepting a valid Campaign can never leave the
    // recovery screen stuck, however `restoring` came to be true.
    setRestoring(false);
    setStep('detail');
    setDetailCampaignId(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Campaign detail read: re-fetched from the server on every arrival at
  // 'detail' (including reload/restore above) and on explicit retry after a
  // transient error -- never from trusted client state, never creates
  // anything (GET only).
  useEffect(() => {
    if (step !== 'detail' || !detailCampaignId) return;
    let cancelled = false;
    setDetailError(false);
    fetchCampaignById(detailCampaignId).then(found => {
      if (cancelled) return;
      if (found) {
        setDetail(found);
      } else {
        setDetailError(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [step, detailCampaignId, detailReloadAttempt]);

  // Post-launch Analysis read/retry (PRODUCT §15.3, ADR-0009 §11.1). A
  // confirmed 404 means the durable worker has not created the initial
  // attempt yet (within its 15-minute SLA) -- a safe waiting state, never a
  // reason to create a Snapshot from this GET. An explicit retry command
  // (handlePostLaunchRetry) is consumed here the same way the pre-launch
  // flow above consumes analysisCommandRef: only once the read confirms the
  // exact failed attempt it targets.
  useEffect(() => {
    if (step !== 'detail' || !detail?.analysis_context) return;
    const { technical_assignment_id: technicalAssignmentId, source_revision: revision } = detail.analysis_context;
    const campaignId = detail.campaign_id;
    let cancelled = false;

    const settle = (): void => {
      setPostLaunchLoading(false);
      postLaunchRetryInFlightRef.current = false;
    };

    const createFromCommand = async (command: PostLaunchRetryCommandState): Promise<void> => {
      const created = await createPostLaunchRefreshRetry(
        command.idempotencyKey,
        technicalAssignmentId,
        revision,
        campaignId,
        command.retryOfAnalysisSnapshotId
      );
      if (cancelled) return;
      if (created.kind === 'snapshot') {
        setPostLaunchSnapshot(created.snapshot);
        setPostLaunchError(null);
      } else if (created.kind === 'rejected') {
        postLaunchCommandRef.current = null;
        setPostLaunchError(analysisFailureMessage(created.error));
      } else {
        setPostLaunchError('Не удалось повторить анализ после запуска: сервис временно недоступен. Попробуйте ещё раз.');
      }
      settle();
    };

    setPostLaunchLoading(true);
    setPostLaunchError(null);

    fetchCurrentPostLaunchRefreshAnalysisSnapshot(technicalAssignmentId, revision, campaignId).then(async current => {
      if (cancelled) return;
      if (current.kind === 'snapshot') {
        const pendingRetry = postLaunchCommandRef.current;
        if (pendingRetry && pendingRetry.retryOfAnalysisSnapshotId === current.snapshot.analysis_snapshot_id) {
          await createFromCommand(pendingRetry);
          return;
        }
        setPostLaunchSnapshot(current.snapshot);
        settle();
        return;
      }
      if (current.kind === 'not_found') {
        setPostLaunchSnapshot(null);
        settle();
        return;
      }
      setPostLaunchSnapshot(null);
      settle();
      if (current.kind === 'rejected') {
        setPostLaunchError(analysisFailureMessage(current.error));
      } else {
        setPostLaunchError('Не удалось получить статус анализа после запуска: сервис временно недоступен.');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [step, detail?.campaign_id, detail?.analysis_context?.technical_assignment_id, detail?.analysis_context?.source_revision, postLaunchReloadAttempt]);

  // Server-owned Analysis restore/create flow. A confirmed 404 is the only
  // condition that creates the first attempt. Transport failures reuse the
  // same command key, while a new key is generated only for an explicit
  // retry of a retryable terminal failure.
  useEffect(() => {
    if (step !== 'analysis' || !assignment || assignment.lifecycle_status !== 'ready_for_analysis') return;

    const technicalAssignmentId = assignment.technical_assignment_id;
    const revision = assignment.revision;
    let cancelled = false;

    const commandFor = (retryOfAnalysisSnapshotId: string | null): AnalysisCommandState => {
      const current = analysisCommandRef.current;
      if (
        current
        && current.technicalAssignmentId === technicalAssignmentId
        && current.revision === revision
        && current.retryOfAnalysisSnapshotId === retryOfAnalysisSnapshotId
      ) {
        return current;
      }
      const next = {
        technicalAssignmentId,
        revision,
        idempotencyKey: crypto.randomUUID(),
        retryOfAnalysisSnapshotId
      };
      analysisCommandRef.current = next;
      return next;
    };

    const createFromCommand = async (command: AnalysisCommandState): Promise<void> => {
      const created = await createPreLaunchAnalysisSnapshot(
        command.idempotencyKey,
        command.technicalAssignmentId,
        command.revision,
        command.retryOfAnalysisSnapshotId
      );
      if (cancelled) return;
      setAnalysisLoading(false);
      if (created.kind === 'snapshot') {
        setAnalysisSnapshot(created.snapshot);
        setAnalysisError(null);
        return;
      }
      if (created.kind === 'rejected') {
        analysisCommandRef.current = null;
        setAnalysisSnapshot(null);
        setAnalysisError(analysisFailureMessage(created.error));
        return;
      }
      setAnalysisSnapshot(null);
      setAnalysisError('Не удалось получить предварительный анализ: сервис временно недоступен. Повторите запрос с сохранённой ссылки.');
    };

    setAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysisSnapshot(previous => (analysisMatchesAssignment(previous, assignment) ? previous : null));

    void fetchCurrentPreLaunchAnalysisSnapshot(technicalAssignmentId, revision).then(async current => {
      if (cancelled) return;
      // The retry in-flight guard (handleAnalysisRetry) is released here,
      // unconditionally, once this effect run reaches a terminal outcome --
      // whether it actually consumed a pending retry command below, found a
      // different state (letting a stale guard un-stick rather than
      // permanently disable the button), or this run was not a retry at
      // all (in which case the ref is already false and this is a no-op).
      try {
        if (current.kind === 'snapshot') {
          const pendingRetry = analysisCommandRef.current;
          if (
            pendingRetry
            && pendingRetry.technicalAssignmentId === technicalAssignmentId
            && pendingRetry.revision === revision
            && pendingRetry.retryOfAnalysisSnapshotId === current.snapshot.analysis_snapshot_id
          ) {
            await createFromCommand(pendingRetry);
            return;
          }
          setAnalysisSnapshot(current.snapshot);
          setAnalysisLoading(false);
          return;
        }
        if (current.kind === 'not_found') {
          setAnalysisSnapshot(null);
          await createFromCommand(commandFor(null));
          return;
        }
        setAnalysisLoading(false);
        setAnalysisSnapshot(null);
        if (current.kind === 'rejected') {
          setAnalysisError(analysisFailureMessage(current.error));
        } else {
          setAnalysisError('Не удалось получить предварительный анализ: сервис временно недоступен. Ссылка на Техническое задание сохранена.');
        }
      } finally {
        analysisRetryInFlightRef.current = false;
      }
    });

    return () => {
      cancelled = true;
    };
  }, [step, assignment?.technical_assignment_id, assignment?.revision, analysisReloadAttempt]);

  // A pending attempt is refreshed by reading the same server-owned logical
  // request. This never creates a second Snapshot or increments an attempt.
  useEffect(() => {
    if (step !== 'analysis' || analysisSnapshot?.status !== 'pending') return;
    const timer = window.setTimeout(() => setAnalysisReloadAttempt(attempt => attempt + 1), 2000);
    return () => window.clearTimeout(timer);
  }, [step, analysisSnapshot?.analysis_snapshot_id, analysisSnapshot?.status, analysisReloadAttempt]);

  // Never silent: warns before a reload/close if there are edits since the
  // last successful "Сохранить" (see the note on hasUnsavedChanges above).
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  const handleFieldChange = (fieldId: string, value: unknown) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
    setHasUnsavedChanges(true);
  };

  const handleRentRateChange = (rawText: string) => {
    setRentRateText(rawText);
  };

  const handleRequestBudgetModeChange = (mode: RentMode) => {
    if (mode === 'rate' && requestBudgetMode !== 'rate') {
      const total = formValues.request_monthly_budget_max_rub;
      const area = formValues.request_area_max_sqm;
      if (typeof total === 'number' && typeof area === 'number' && area > 0) {
        setRequestRentRateText(formatDecimalForDisplay(computeRatePerSqmFromTotal(total, area)));
      }
    }
    if (mode === 'total') {
      setFormValues(prev => ({ ...prev, [REQUEST_RENT_RATE_FIELD_ID]: undefined }));
    }
    setRequestBudgetMode(mode);
    setRequestRentRateInvalid(false);
    setRequestRentRateTouched(false);
    setHasUnsavedChanges(true);
  };

  const handleRequestRentRateChange = (rawText: string) => {
    setRequestRentRateText(rawText);
    setHasUnsavedChanges(true);
  };

  // Single source of truth for `property_monthly_rent_rub` while in rate
  // mode: recomputes total = rate * area (the fixed formula) whenever the
  // rate text, the mode, or the area itself changes -- so a later edit to
  // area never leaves a stale total that no longer matches the entered rate.
  useEffect(() => {
    if (rentMode !== 'rate') return;
    const result = parseDecimalInput(rentRateText, RENT_RATE_LIMITS);
    if (result.kind === 'value') {
      setRentRateInvalid(false);
      const area = formValues.property_area_sqm;
      handleFieldChange('property_monthly_rent_rub', typeof area === 'number' && area > 0 ? computeTotalRentFromRate(result.value, area) : undefined);
    } else {
      setRentRateInvalid(result.kind === 'invalid');
      handleFieldChange('property_monthly_rent_rub', undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rentRateText, rentMode, formValues.property_area_sqm]);

  // TenantRequest keeps both constraints: the entered max rate and a
  // backward-compatible max total derived from the requested max area.
  useEffect(() => {
    if (requestBudgetMode !== 'rate') return;
    const result = parseDecimalInput(requestRentRateText, RENT_RATE_LIMITS);
    const area = formValues.request_area_max_sqm;
    if (result.kind === 'value') {
      setRequestRentRateInvalid(false);
      setFormValues(prev => ({
        ...prev,
        [REQUEST_RENT_RATE_FIELD_ID]: result.value,
        request_monthly_budget_max_rub:
          typeof area === 'number' && area > 0 ? computeTotalRentFromRate(result.value, area) : undefined
      }));
    } else {
      setRequestRentRateInvalid(result.kind === 'invalid');
      setFormValues(prev => ({
        ...prev,
        [REQUEST_RENT_RATE_FIELD_ID]: undefined,
        request_monthly_budget_max_rub: undefined
      }));
    }
  }, [requestRentRateText, requestBudgetMode, formValues.request_area_max_sqm]);

  const handleDecimalChange = (field: TAFieldDef, rawText: string) => {
    const limits = field.decimalLimits;
    if (!limits) return;
    const result = parseDecimalInput(rawText, limits);
    setDecimalState(prev => ({ ...prev, [field.fieldId]: { rawText, invalid: result.kind === 'invalid', touched: prev[field.fieldId]?.touched ?? false } }));
    if (result.kind === 'value') {
      handleFieldChange(field.fieldId, result.value);
    } else {
      handleFieldChange(field.fieldId, undefined);
    }
  };

  const handleDecimalBlur = (field: TAFieldDef) => {
    setDecimalState(prev => {
      const current = prev[field.fieldId];
      if (!current) return prev;
      const next = { ...current, touched: true };
      return { ...prev, [field.fieldId]: next };
    });
    const value = formValues[field.fieldId];
    if (typeof value === 'number') {
      setDecimalState(prev => ({ ...prev, [field.fieldId]: { rawText: formatDecimalForDisplay(value), invalid: false, touched: true } }));
    }
  };

  const handleStringArrayInputChange = (field: TAFieldDef, rawText: string) => {
    const current = (formValues[field.fieldId] as string[] | undefined) ?? [];
    const { values, draft } = splitStringArrayInput(current, rawText);
    if (values) handleFieldChange(field.fieldId, values);
    setStringArrayDraft(prev => ({ ...prev, [field.fieldId]: draft }));
    setHasUnsavedChanges(true);
  };

  const handleStringArrayCommit = (field: TAFieldDef) => {
    const current = (formValues[field.fieldId] as string[] | undefined) ?? [];
    const draft = stringArrayDraft[field.fieldId] ?? '';
    if (draft.trim() === '') return;
    handleFieldChange(field.fieldId, addStringArrayToken(current, draft));
    setStringArrayDraft(prev => ({ ...prev, [field.fieldId]: '' }));
  };

  const handleStringArrayRemove = (field: TAFieldDef, value: string) => {
    const current = (formValues[field.fieldId] as string[] | undefined) ?? [];
    handleFieldChange(field.fieldId, removeStringArrayToken(current, value));
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveErrorHighlightFieldIds([]);

    // A token the user finished typing into a tag field (property_districts /
    // request_districts / request_cities) but never confirmed via Enter or a
    // trailing comma must still be saved, not silently dropped -- flush any
    // such pending draft into the outgoing payload (and back into state, so
    // the visible chips match what was actually sent) before saving.
    let payload = formValues;
    const flushed: Record<string, string> = {};
    for (const field of fields) {
      if (field.kind !== 'string_array') continue;
      const draft = stringArrayDraft[field.fieldId];
      if (!draft || draft.trim() === '') continue;
      const current = (payload[field.fieldId] as string[] | undefined) ?? [];
      const next = addStringArrayToken(current, draft);
      if (next !== current) {
        payload = { ...payload, [field.fieldId]: next };
        flushed[field.fieldId] = '';
      }
    }
    if (payload !== formValues) {
      setFormValues(payload);
      setStringArrayDraft(prev => ({ ...prev, ...flushed }));
    }

    const result = await saveTechnicalAssignmentDraft(taIdempotencyKey, scenario, payload, assignment ?? undefined);
    setSaving(false);
    if (result.kind === 'saved') {
      const analysisIdentityChanged = !assignment
        || assignment.technical_assignment_id !== result.assignment.technical_assignment_id
        || assignment.revision !== result.assignment.revision;
      setAssignment(result.assignment);
      if (analysisIdentityChanged) {
        setAnalysisSnapshot(null);
        setAnalysisError(null);
        analysisCommandRef.current = null;
        setContactsGateConfirmed(false);
        setLaunchIdempotencyKey(crypto.randomUUID());
      }
      setMissingFields(isReadyForAnalysis(result.assignment.lifecycle_status) ? [] : computeMissingRequiredFields(fields, result.assignment.payload));
      setHasUnsavedChanges(false);
      // Defect 1: an opaque, safe reference to the just-saved draft is now
      // recoverable after a reload or a return to this tab -- see the
      // restore-on-mount effect above. replaceState (not pushState) so
      // clicking "Сохранить" repeatedly does not pile up history entries.
      const nextSearch = buildSearchWithTechnicalAssignmentId(window.location.search, result.assignment.technical_assignment_id);
      window.history.replaceState(null, '', `${window.location.pathname}${nextSearch}`);
      return;
    }
    setMissingFields([]);
    if (result.kind === 'invalid') {
      const explanation = explainTechnicalAssignmentError(result.error, result.field_id, formValues, fields);
      setSaveError(explanation.message);
      setSaveErrorHighlightFieldIds(explanation.highlightFieldIds);
      return;
    }
    setSaveError('Не удалось сохранить Техническое задание: сервис временно недоступен.');
  };

  const handleAnalysisRetry = () => {
    // Checked and set synchronously, first, before any other condition --
    // a second call within the same tick (double click before the next
    // render) must be rejected even though `analysisLoading` has not been
    // committed yet.
    if (analysisRetryInFlightRef.current) return;
    if (
      !assignment
      || !analysisSnapshot
      || analysisSnapshot.status !== 'failed'
      || !analysisSnapshot.failure?.retryable
      || !analysisMatchesAssignment(analysisSnapshot, assignment)
    ) {
      return;
    }
    analysisRetryInFlightRef.current = true;
    analysisCommandRef.current = {
      technicalAssignmentId: assignment.technical_assignment_id,
      revision: assignment.revision,
      idempotencyKey: crypto.randomUUID(),
      retryOfAnalysisSnapshotId: analysisSnapshot.analysis_snapshot_id
    };
    setAnalysisError(null);
    setAnalysisReloadAttempt(attempt => attempt + 1);
  };

  const handlePostLaunchRetry = () => {
    // Same synchronous-guard-first pattern as handleAnalysisRetry above.
    if (postLaunchRetryInFlightRef.current) return;
    if (
      !detail?.analysis_context
      || !postLaunchSnapshot
      || postLaunchSnapshot.status !== 'failed'
      || !postLaunchSnapshot.failure?.retryable
    ) {
      return;
    }
    postLaunchRetryInFlightRef.current = true;
    postLaunchCommandRef.current = {
      idempotencyKey: crypto.randomUUID(),
      retryOfAnalysisSnapshotId: postLaunchSnapshot.analysis_snapshot_id
    };
    setPostLaunchError(null);
    setPostLaunchReloadAttempt(attempt => attempt + 1);
  };

  const handleLaunch = async () => {
    if (!assignment || !analysisAllowsProgress(analysisSnapshot, assignment) || !analysisSnapshot) {
      setLaunchError('Запуск недоступен: требуется актуальный завершённый предварительный анализ.');
      setStep('analysis');
      setAnalysisReloadAttempt(attempt => attempt + 1);
      return;
    }
    setLaunching(true);
    setLaunchError(null);
    const result = await launchCampaign(
      launchIdempotencyKey,
      assignment.technical_assignment_id,
      assignment.revision,
      analysisSnapshot.analysis_snapshot_id
    );
    setLaunching(false);
    if (result.kind === 'created' || result.kind === 'replayed') {
      setCampaign(result.campaign);
      setWasReplay(result.kind === 'replayed');
      setStep('success');
      // The Technical Assignment wizard flow is done -- `campaign` becomes
      // the URL's only recovery identity from here on, so a reload/return
      // opens Campaign detail (via the restore-on-mount effect above)
      // instead of racing with the `ta` restore.
      const searchWithoutTa = buildSearchWithoutTechnicalAssignmentId(window.location.search);
      const nextSearch = buildSearchWithCampaignId(searchWithoutTa, result.campaign.campaign_id);
      window.history.replaceState(null, '', `${window.location.pathname}${nextSearch}`);
      return;
    }
    if (
      result.kind === 'invalid'
      && (result.error === 'TECHNICAL_ASSIGNMENT_ANALYSIS_REQUIRED' || result.error === 'TECHNICAL_ASSIGNMENT_ANALYSIS_STALE')
    ) {
      setAnalysisSnapshot(null);
      setAnalysisError('Предварительный анализ больше не актуален. Получите текущий результат перед повторным запуском.');
      setContactsGateConfirmed(false);
      setStep('analysis');
      setAnalysisReloadAttempt(attempt => attempt + 1);
      return;
    }
    setLaunchError(
      result.kind === 'invalid'
        ? `Не удалось запустить кампанию: ${result.error}`
        : 'Не удалось запустить кампанию: сервис временно недоступен. Попробуйте ещё раз.'
    );
  };

  const openDetail = () => {
    if (!campaign) return;
    // Data loading itself is owned by the Campaign detail effect above,
    // keyed on detailCampaignId -- this only navigates and (defensively,
    // handleLaunch's success branch already does this) keeps the URL
    // recovery reference in sync.
    setDetail(null);
    setDetailError(false);
    setPostLaunchSnapshot(null);
    setPostLaunchError(null);
    setDetailCampaignId(campaign.campaign_id);
    setStep('detail');
    const nextSearch = buildSearchWithCampaignId(window.location.search, campaign.campaign_id);
    window.history.replaceState(null, '', `${window.location.pathname}${nextSearch}`);
  };

  if (restoring) {
    return (
      <section>
        <p>Восстановление ранее сохранённого Технического задания...</p>
      </section>
    );
  }

  if (restoreFailed) {
    return (
      <section>
        <h2>Восстановление Технического задания</h2>
        <p role="alert">{restoreNotice}</p>
        <button type="button" onClick={() => setRestoreAttempt(attempt => attempt + 1)}>
          Повторить восстановление
        </button>
      </section>
    );
  }

  if (step === 'goal') {
    return (
      <section>
        <h1>Перестаньте искать. Начните заключать сделки.</h1>
        <p>
          LeaseMind — AI-платформа управления спросом на коммерческую недвижимость. AI работает каждый день, чтобы
          привести вашу сделку к результату.
        </p>
        {restoreNotice && <p role="alert">{restoreNotice}</p>}
        <h2>Выбор цели</h2>
        <p>Синтетическая демонстрация. Выберите роль, чтобы продолжить:</p>
        <button type="button" onClick={() => setGoal('owner')} aria-pressed={goal === 'owner'}>
          Мне нужен арендатор
        </button>{' '}
        <button type="button" onClick={() => setGoal('tenant')} aria-pressed={goal === 'tenant'}>
          Мне нужно помещение
        </button>
        <p>
          <button type="button" disabled={!goal} onClick={() => setStep('ta')}>
            Далее
          </button>
        </p>
      </section>
    );
  }

  if (step === 'ta') {
    const ready = isReadyForAnalysis(assignment?.lifecycle_status);
    const renderCtx: RenderFieldContext = {
      values: formValues,
      onChange: handleFieldChange,
      decimalState,
      onDecimalChange: handleDecimalChange,
      onDecimalBlur: handleDecimalBlur,
      stringArrayDraft,
      onStringArrayInputChange: handleStringArrayInputChange,
      onStringArrayCommit: handleStringArrayCommit,
      onStringArrayRemove: handleStringArrayRemove
    };
    return (
      <section>
        <h2>Техническое задание</h2>
        <p>
          Сценарий: {ruLabel(SCENARIO_LABELS, scenario)}. Состояние: {ruLabel(LIFECYCLE_STATUS_LABELS, assignment?.lifecycle_status ?? 'draft')}{' '}
          (ревизия {assignment?.revision ?? '-'})
        </p>
        <p>* — обязательное поле</p>
        {FIELD_GROUPS.map(group => {
          const groupFields = fields.filter(field => field.group === group && field.fieldId !== REQUEST_RENT_RATE_FIELD_ID);
          if (groupFields.length === 0) return null;
          return (
            <fieldset key={group} style={{ marginBottom: '1em' }}>
              <legend>{group}</legend>
              <table>
                <tbody>
                  {groupFields.map(field => {
                    const isMissing = missingFields.some(f => f.fieldId === field.fieldId);
                    const isErrorHighlighted = saveErrorHighlightFieldIds.includes(field.fieldId);
                    const rowStyle = isErrorHighlighted
                      ? { background: '#f8d7da', outline: '2px solid #c0392b' }
                      : isMissing
                        ? { background: '#fff3cd', outline: '2px solid #d9822b' }
                        : undefined;
                    return (
                      <tr key={field.fieldId} id={`ta-field-${field.fieldId}`} style={rowStyle}>
                        <td>
                          {field.label}
                          {field.required && <span aria-hidden="true"> *</span>}
                        </td>
                        <td>
                          {field.fieldId === 'property_monthly_rent_rub' ? (
                            <RentField
                              context="property"
                              mode={rentMode}
                              onModeChange={setRentMode}
                              totalValue={formValues.property_monthly_rent_rub as number | undefined}
                              onTotalChange={value => handleFieldChange('property_monthly_rent_rub', value)}
                              areaSqm={formValues.property_area_sqm as number | undefined}
                              rateText={rentRateText}
                              rateInvalid={rentRateInvalid}
                              rateTouched={rentRateTouched}
                              onRateChange={handleRentRateChange}
                              onRateBlur={() => setRentRateTouched(true)}
                            />
                          ) : field.fieldId === 'request_monthly_budget_max_rub' ? (
                            <RentField
                              context="request"
                              mode={requestBudgetMode}
                              onModeChange={handleRequestBudgetModeChange}
                              totalValue={formValues.request_monthly_budget_max_rub as number | undefined}
                              onTotalChange={value => handleFieldChange('request_monthly_budget_max_rub', value)}
                              areaSqm={formValues.request_area_max_sqm as number | undefined}
                              rateText={requestRentRateText}
                              rateInvalid={requestRentRateInvalid}
                              rateTouched={requestRentRateTouched}
                              onRateChange={handleRequestRentRateChange}
                              onRateBlur={() => setRequestRentRateTouched(true)}
                            />
                          ) : (
                            renderField(field, renderCtx)
                          )}
                          {isErrorHighlighted && saveError && (
                            <div role="alert" style={{ color: '#b00020', marginTop: '0.25em' }}>
                              {saveError}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </fieldset>
          );
        })}
        {saveError && <p role="alert">{saveError}</p>}
        <p>
          <button type="button" onClick={() => setStep('goal')}>
            Назад
          </button>{' '}
          <button type="button" disabled={saving} onClick={() => void handleSaveDraft()}>
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>{' '}
          <button type="button" disabled={!ready} onClick={() => setStep('analysis')}>
            Далее (Анализ)
          </button>
        </p>
        {!ready &&
          (missingFields.length > 0 ? (
            <div role="alert">
              <p>Техническое задание сохранено как черновик. Не заполнены обязательные поля:</p>
              <ul>
                {missingFields.map(field => (
                  <li key={field.fieldId}>{explainMissingRequiredField(field.fieldId, field.label)}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p>Переход к Анализу недоступен, пока Техническое задание не заполнено полностью и не прошло проверку («{LIFECYCLE_STATUS_LABELS.ready_for_analysis}»).</p>
          ))}
      </section>
    );
  }

  if (step === 'analysis') {
    if (!assignment || assignment.lifecycle_status !== 'ready_for_analysis') {
      return (
        <section>
          <h2>Анализ</h2>
          <p>Техническое задание ещё не готово. Вернитесь к предыдущему шагу.</p>
          <button type="button" onClick={() => setStep('ta')}>
            Назад к Техническому заданию
          </button>
        </section>
      );
    }
    const analysisReady = !analysisLoading && analysisAllowsProgress(analysisSnapshot, assignment);
    const currentTerminalSnapshot = analysisReady && analysisSnapshot?.results ? analysisSnapshot : null;

    return (
      <section>
        <h2>Предварительный анализ</h2>
        <p><strong>{SYNTHETIC_DATA_MARKER}</strong></p>
        <p>
          Техническое задание: {assignment.technical_assignment_id}. Версия: {assignment.revision}.
        </p>
        {analysisLoading && !analysisSnapshot && <p>Подготавливаем анализ...</p>}
        {analysisError && (
          <div role="alert">
            <p>{analysisError}</p>
            <button type="button" onClick={() => setAnalysisReloadAttempt(attempt => attempt + 1)}>
              Повторить загрузку
            </button>
          </div>
        )}
        {analysisSnapshot?.freshness_status === 'stale' && (
          <p role="alert">{analysisFreshnessMessage(analysisSnapshot)}</p>
        )}
        {analysisSnapshot?.freshness_status === 'current' && analysisSnapshot.status === 'pending' && (
          <p>Расчёт выполняется. Результат обновится автоматически.</p>
        )}
        {analysisSnapshot?.freshness_status === 'current' && analysisSnapshot.status === 'failed' && (
          <div role="alert">
            <p>{analysisFailureMessage(analysisSnapshot.failure ?? { code: 'ANALYSIS_GENERATION_FAILED', retryable: false })}</p>
            {analysisSnapshot.failure?.retryable && (
              <button type="button" disabled={analysisLoading} onClick={handleAnalysisRetry}>
                Повторить расчёт
              </button>
            )}
          </div>
        )}
        {currentTerminalSnapshot?.results && (
          <>
            <p>
              Результат сформирован: {formatAnalysisTime(currentTerminalSnapshot.generated_at)}.
              Попытка расчёта: {currentTerminalSnapshot.calculation_attempt}.
            </p>
            <AnalysisResultBlocks results={currentTerminalSnapshot.results} scenario={assignment.scenario} />
          </>
        )}
        <p>
          <button type="button" onClick={() => setStep('ta')}>
            Назад
          </button>{' '}
          <button
            type="button"
            disabled={!analysisReady}
            onClick={() => {
              setContactsGateConfirmed(false);
              setStep('contacts');
            }}
          >
            Далее (Контакты)
          </button>
        </p>
      </section>
    );
  }

  if (step === 'contacts') {
    // Defense-in-depth, independent of how `step` got here (ADR-0007/0008,
    // 02_PRODUCT/CAMPAIGN_TECHNICAL_ASSIGNMENT.md §3.1): the Contacts Gate
    // must never render for a Technical Assignment that is not itself
    // ready_for_analysis, regardless of which button led here -- mirrors the
    // equivalent guard already on the 'analysis' step above.
    if (
      !assignment
      || assignment.lifecycle_status !== 'ready_for_analysis'
      || !analysisAllowsProgress(analysisSnapshot, assignment)
    ) {
      return (
        <section>
          <h2>Контакты</h2>
          <p>Переход к Контактам недоступен: требуется актуальный завершённый предварительный анализ текущей версии Технического задания.</p>
          <button type="button" onClick={() => setStep('analysis')}>
            Назад к Анализу
          </button>
        </section>
      );
    }
    return (
      <section>
        <h2>Контакты</h2>
        <p>⚠ Синтетические демонстрационные данные. Реальные ФИО, телефон, email или иные персональные данные не принимаются и не сохраняются.</p>
        <ul>
          <li>ФИО: {SYNTHETIC_CONTACT_FIXTURE.name}</li>
          <li>Телефон: {SYNTHETIC_CONTACT_FIXTURE.phone}</li>
          <li>Email: {SYNTHETIC_CONTACT_FIXTURE.email}</li>
        </ul>
        <p>
          <label>
            <input type="checkbox" checked={contactsGateConfirmed} onChange={e => setContactsGateConfirmed(e.target.checked)} />{' '}
            Я ознакомлен(а) с синтетическими демонстрационными контактными данными и подтверждаю переход к запуску кампании.
          </label>
        </p>
        {!contactsGateConfirmed && <p role="alert">Отметьте подтверждение выше, чтобы продолжить.</p>}
        <p>
          <button type="button" onClick={() => setStep('analysis')}>
            Назад
          </button>{' '}
          <button type="button" disabled={!contactsGateConfirmed} onClick={() => setStep('launch')}>
            Далее
          </button>
        </p>
      </section>
    );
  }

  if (step === 'launch') {
    // Same defense-in-depth pattern as 'analysis'/'contacts' above: a client
    // that reaches this step without the Contacts Gate confirmation (e.g. by
    // tampering with component state) still cannot launch -- the actual
    // security boundary is server-side (ADR-0008 section 2: the launch
    // command independently re-verifies contacts_gate_evidence inside its
    // own transaction, before ever looking at the Technical Assignment row),
    // this is only the UI staying consistent with that.
    if (!contactsGateConfirmed) {
      return (
        <section>
          <h2>Запуск кампании</h2>
          <p>Переход к запуску недоступен: подтверждение экрана «Контакты» не получено.</p>
          <button type="button" onClick={() => setStep('contacts')}>
            Назад к Контактам
          </button>
        </section>
      );
    }
    if (!assignment || !analysisAllowsProgress(analysisSnapshot, assignment)) {
      return (
        <section>
          <h2>Запуск кампании</h2>
          <p>Переход к запуску недоступен: требуется актуальный завершённый предварительный анализ.</p>
          <button type="button" onClick={() => setStep('analysis')}>
            Назад к Анализу
          </button>
        </section>
      );
    }
    return (
      <section>
        <h2>Запуск кампании</h2>
        <p>Цель: {goal === 'owner' ? 'Мне нужен арендатор' : 'Мне нужно помещение'}</p>
        <p>
          ID технического задания: {assignment?.technical_assignment_id}, ревизия: {assignment?.revision}
        </p>
        <p>После запуска мы начинаем поиск и анализ и сопровождаем вас на пути к сделке.</p>
        {launchError && <p role="alert">{launchError}</p>}
        <p>
          <button type="button" disabled={launching} onClick={() => setStep('contacts')}>
            Назад
          </button>{' '}
          <button type="button" disabled={launching || !analysisAllowsProgress(analysisSnapshot, assignment)} onClick={() => void handleLaunch()}>
            {launching ? 'Запуск...' : 'Запустить кампанию'}
          </button>
        </p>
      </section>
    );
  }

  if (step === 'success' && campaign) {
    return (
      <section>
        <h2>Кампания запущена</h2>
        <p>{wasReplay ? 'Эта кампания уже была запущена ранее — повторный запуск не создал дубликат.' : 'Синтетическая кампания успешно создана.'}</p>
        <p>ID кампании: {campaign.campaign_id}</p>
        <p>Не позднее 15 минут мы подготовим первичный анализ.</p>
        <p>
          <button type="button" onClick={openDetail}>
            Перейти к кампании
          </button>
        </p>
      </section>
    );
  }

  if (step === 'detail') {
    // No launch button anywhere on this screen, in any state (PRODUCT
    // §15.3: refresh never brings back the launch button) -- Campaign
    // status and Analysis refresh status are always rendered as two
    // distinct fields; a failed/stale refresh never overwrites or implies
    // a change to campaignStatusLabel below.
    const campaignStatusLabel = detail ? ruLabel(CAMPAIGN_STATUS_LABELS, detail.status) : null;
    const showResults = postLaunchSnapshot?.results && postLaunchSnapshot.freshness_status === 'current';

    return (
      <section>
        <h2>Детали кампании</h2>
        {detailError && (
          <div role="alert">
            <p>Не удалось загрузить кампанию.</p>
            <button type="button" onClick={() => setDetailReloadAttempt(attempt => attempt + 1)}>
              Повторить загрузку
            </button>
          </div>
        )}
        {!detailError && !detail && <p>Загрузка...</p>}
        {detail && (
          <>
            <ul>
              <li>ID кампании: {detail.campaign_id}</li>
              <li>Статус кампании: {campaignStatusLabel}</li>
              <li>Версия: {detail.aggregate_version}</li>
              <li>Создано: {detail.created_at}</li>
              <li>Обновлено: {detail.updated_at}</li>
            </ul>

            <section aria-labelledby="campaign-outcome-heading">
              <h3 id="campaign-outcome-heading">Результат кампании</h3>

              {!detail.outcome_context && (
                <p>Результат кампании пока не зафиксирован.</p>
              )}

              {detail.outcome_context && (
                <ul>
                  <li>{ruLabel(CAMPAIGN_OUTCOME_CODE_LABELS, detail.outcome_context.outcome_code)}</li>
                  <li>Зафиксировано: {formatAnalysisTime(detail.outcome_context.recorded_at)}</li>
                  <li>Явное подтверждение пользователя</li>
                  <li>Уполномоченный администратор пилота</li>
                  {detail.outcome_context.is_corrected && <li>Результат уточнён.</li>}
                </ul>
              )}
            </section>

            <section aria-labelledby="post-launch-analysis-heading">
              <h3 id="post-launch-analysis-heading">Анализ после запуска</h3>

              {!detail.analysis_context && (
                <p>Анализ после запуска для этой кампании недоступен.</p>
              )}

              {detail.analysis_context && (
                <>
                  <p><strong>{SYNTHETIC_DATA_MARKER}</strong></p>

                  {postLaunchLoading && !postLaunchSnapshot && <p>Загрузка статуса анализа...</p>}

                  {postLaunchError && (
                    <div role="alert">
                      <p>{postLaunchError}</p>
                      <button type="button" onClick={() => setPostLaunchReloadAttempt(attempt => attempt + 1)}>
                        Повторить загрузку
                      </button>
                    </div>
                  )}

                  {!postLaunchLoading && !postLaunchError && !postLaunchSnapshot && (
                    <p>
                      Статус анализа после запуска: {POST_LAUNCH_STATUS_LABELS.pending}. Начато: {formatAnalysisTime(detail.created_at)}.
                      Не позднее 15 минут после запуска мы подготовим результат.
                    </p>
                  )}

                  {postLaunchSnapshot && (
                    <>
                      <p>
                        Статус анализа после запуска: {POST_LAUNCH_STATUS_LABELS[postLaunchSnapshot.status]}.
                        Попытка расчёта: {postLaunchSnapshot.calculation_attempt}.
                      </p>

                      {postLaunchSnapshot.status !== 'pending' && (
                        <p>Результат сформирован: {formatAnalysisTime(postLaunchSnapshot.generated_at)}.</p>
                      )}

                      {postLaunchSnapshot.freshness_status === 'stale' && (
                        <p role="alert">{postLaunchFreshnessMessage(postLaunchSnapshot)}</p>
                      )}

                      {postLaunchSnapshot.freshness_status === 'current' && postLaunchSnapshot.status === 'pending' && (
                        <p>
                          Начато: {formatAnalysisTime(postLaunchSnapshot.created_at)}. Не позднее 15 минут после запуска
                          мы подготовим результат.
                        </p>
                      )}

                      {postLaunchSnapshot.freshness_status === 'current' && postLaunchSnapshot.status === 'failed' && (
                        <div role="alert">
                          <p>{analysisFailureMessage(postLaunchSnapshot.failure ?? { code: 'ANALYSIS_GENERATION_FAILED', retryable: false })}</p>
                          {postLaunchSnapshot.failure?.retryable && (
                            <button type="button" disabled={postLaunchLoading} onClick={handlePostLaunchRetry}>
                              Повторить анализ
                            </button>
                          )}
                        </div>
                      )}

                      {showResults && postLaunchSnapshot.results && (
                        <AnalysisResultBlocks results={postLaunchSnapshot.results} scenario={detail.analysis_context.scenario} />
                      )}
                    </>
                  )}
                </>
              )}
            </section>
          </>
        )}
      </section>
    );
  }

  return null;
}
