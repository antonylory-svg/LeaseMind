import { useEffect, useState } from 'react';
import { launchCampaign } from './campaignCommand';
import { fetchCampaignById, type Campaign } from './campaigns';
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
import { SCENARIO_LABELS, LIFECYCLE_STATUS_LABELS, CAMPAIGN_STATUS_LABELS, ruLabel } from './ruLabels';
import { explainTechnicalAssignmentError, explainMissingRequiredField } from './technicalAssignmentErrorMessages';

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

// UI-only entry mode for `property_monthly_rent_rub` (ADR-0008 field_id,
// unchanged). Not a contract field, never sent on its own -- only the
// resulting total (rounded rub/month) is ever written into formValues and
// submitted. See technicalAssignmentFormLogic.ts for the fixed formulas.
const RENT_RATE_LIMITS = { min: 1, max: 100000000, decimals: 2 };

type RentMode = 'rate' | 'total';

interface RentFieldProps {
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
  const { mode, onModeChange, totalValue, onTotalChange, areaSqm, rateText, rateInvalid, rateTouched, onRateChange, onRateBlur } = props;
  const hasArea = typeof areaSqm === 'number';
  const showRateError = rateTouched && rateInvalid && rateText.trim() !== '';

  return (
    <span>
      <span style={{ display: 'block', marginBottom: '0.25em' }}>
        <label style={{ marginRight: '1em' }}>
          <input type="radio" name="ta-rent-mode" checked={mode === 'rate'} onChange={() => onModeChange('rate')} /> Ставка за м²
        </label>
        <label>
          <input type="radio" name="ta-rent-mode" checked={mode === 'total'} onChange={() => onModeChange('total')} /> Общая сумма
        </label>
      </span>
      {mode === 'rate' ? (
        <span>
          <label>
            Ставка аренды, ₽/м²/мес{' '}
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
          <p>Вы указали ставку</p>
          {hasArea && typeof totalValue === 'number' ? (
            <p>
              Расчётная общая аренда: ≈ {formatThousands(totalValue)} ₽/мес за {formatDecimalForDisplay(areaSqm as number)} м²
            </p>
          ) : (
            !hasArea && <p>Укажите площадь, чтобы увидеть расчётную общую аренду.</p>
          )}
        </span>
      ) : (
        <span>
          <label>
            Общая аренда, ₽/мес{' '}
            <input
              type="number"
              value={totalValue === undefined ? '' : totalValue}
              onChange={e => onTotalChange(e.target.value === '' ? undefined : Number(e.target.value))}
            />
          </label>
          <p>Вы указали общую сумму</p>
          {hasArea && typeof totalValue === 'number' ? (
            <p>Расчётная ставка: ≈ {formatThousands(computeRatePerSqmFromTotal(totalValue, areaSqm as number))} ₽/м²/мес</p>
          ) : (
            !hasArea && <p>Укажите площадь, чтобы увидеть расчётную ставку.</p>
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
  const [assignment, setAssignment] = useState<TechnicalAssignment | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveErrorHighlightFieldIds, setSaveErrorHighlightFieldIds] = useState<string[]>([]);
  const [missingFields, setMissingFields] = useState<TAFieldDef[]>([]);

  const [launchIdempotencyKey] = useState(() => crypto.randomUUID());
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [wasReplay, setWasReplay] = useState(false);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [detail, setDetail] = useState<Campaign | null>(null);
  const [detailError, setDetailError] = useState(false);

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
  const [restoring, setRestoring] = useState(() => Boolean(getTechnicalAssignmentIdFromSearch(window.location.search)));
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
    if (!id) return;
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
      setFormValues({ ...found.payload });
      setDecimalState(hydrateDecimalState(restoredFields, found.payload));
      setMissingFields(isReadyForAnalysis(found.lifecycle_status) ? [] : computeMissingRequiredFields(restoredFields, found.payload));
      setHasUnsavedChanges(false);
      setStep('ta');
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restoreAttempt]);

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
      setAssignment(result.assignment);
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

  const handleLaunch = async () => {
    if (!assignment) return;
    setLaunching(true);
    setLaunchError(null);
    const result = await launchCampaign(launchIdempotencyKey, assignment.technical_assignment_id, assignment.revision);
    setLaunching(false);
    if (result.kind === 'created' || result.kind === 'replayed') {
      setCampaign(result.campaign);
      setWasReplay(result.kind === 'replayed');
      setStep('success');
      return;
    }
    setLaunchError(
      result.kind === 'invalid'
        ? `Не удалось запустить кампанию: ${result.error}`
        : 'Не удалось запустить кампанию: сервис временно недоступен. Попробуйте ещё раз.'
    );
  };

  const openDetail = async () => {
    if (!campaign) return;
    setDetailError(false);
    setStep('detail');
    const found = await fetchCampaignById(campaign.campaign_id);
    if (found) {
      setDetail(found);
    } else {
      setDetailError(true);
    }
  };

  const refreshAssignment = async () => {
    if (!assignment) return;
    const result = await fetchTechnicalAssignmentById(assignment.technical_assignment_id);
    if (result.kind === 'loaded') setAssignment(result.assignment);
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
          const groupFields = fields.filter(field => field.group === group);
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
    return (
      <section>
        <h2>Анализ</h2>
        <p>
          ID технического задания: {assignment.technical_assignment_id}, ревизия: {assignment.revision}
        </p>
        <p>В течение 15 минут после запуска кампании мы покажем:</p>
        <ul>
          <li>Адекватность цены относительно рынка.</li>
          <li>Количество конкурентов (аналогичных объектов или аналогичного спроса).</li>
          <li>Вероятность сделки за 30 дней.</li>
          <li>Потенциальные категории арендаторов (для собственника) или объектов (для арендатора).</li>
        </ul>
        <p>Первичный анализ — предварительная оценка, не финальный результат кампании. Уточняется по мере поступления данных.</p>
        <p>Анализ носит информационный характер и не является юридической или финансовой рекомендацией. Решения по сделке принимает пользователь.</p>
        <p>
          <button type="button" onClick={() => setStep('ta')}>
            Назад
          </button>{' '}
          <button type="button" onClick={() => void refreshAssignment().then(() => setStep('contacts'))}>
            Далее
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
    if (!assignment || assignment.lifecycle_status !== 'ready_for_analysis') {
      return (
        <section>
          <h2>Контакты</h2>
          <p>Переход к Контактам недоступен: Техническое задание должно быть готово к Анализу («{LIFECYCLE_STATUS_LABELS.ready_for_analysis}»).</p>
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
          <button type="button" disabled={launching || !assignment} onClick={() => void handleLaunch()}>
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
          <button type="button" onClick={() => void openDetail()}>
            Перейти к кампании
          </button>
        </p>
      </section>
    );
  }

  if (step === 'detail') {
    return (
      <section>
        <h2>Детали кампании</h2>
        {detailError && <p role="alert">Не удалось загрузить кампанию.</p>}
        {!detailError && !detail && <p>Загрузка...</p>}
        {detail && (
          <ul>
            <li>ID кампании: {detail.campaign_id}</li>
            <li>Статус: {ruLabel(CAMPAIGN_STATUS_LABELS, detail.status)}</li>
            <li>Версия: {detail.aggregate_version}</li>
            <li>Создано: {detail.created_at}</li>
            <li>Обновлено: {detail.updated_at}</li>
          </ul>
        )}
      </section>
    );
  }

  return null;
}
