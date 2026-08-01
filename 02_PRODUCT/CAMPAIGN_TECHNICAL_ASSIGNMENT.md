# Campaign Technical Assignment

**Файл:** `02_PRODUCT/CAMPAIGN_TECHNICAL_ASSIGNMENT.md`  
**Версия:** 1.0  
**Статус:** Proposal for cross-functional review and approval  
**Владелец:** PRODUCT / Lead Product Architect  
**Тип документа:** Product data contract  
**Дата последней редакции:** 2026-08-01

---

## 1. Назначение

Документ определяет полный контракт данных Технического задания для двух пользовательских сценариев:

1. `need_tenant` — «Мне нужен арендатор»;
2. `need_property` — «Мне нужно помещение».

Контракт закрывает пробел между высокоуровневыми действиями «добавляет объект» / «описывает потребность» и реализацией сущностей `Property`, `TenantRequest`, первичного анализа и Campaign Context.

Документ фиксирует:

- стабильные `field_id`;
- семантику полей;
- типы данных;
- обязательность;
- допустимые значения;
- границы и правила валидации;
- межполевые зависимости;
- принадлежность данных к `Property` или `TenantRequest`;
- состав данных, передаваемых в Campaign;
- правила чувствительности, защиты и запрета персональных данных;
- acceptance-сценарии для DEVELOPMENT.

Документ не проектирует экран, визуальные компоненты, порядок расположения полей или интерактивное поведение интерфейса.

---

## 2. Источники истины

Документ подготовлен исключительно на основании приложенных актуальных файлов:

1. `02_PRODUCT/MVP.md`;
2. `02_PRODUCT/User_Journey.md`;
3. `02_PRODUCT/FIRST_ANALYSIS.md`;
4. `02_PRODUCT/HOMEPAGE.md`;
5. `02_PRODUCT/PRD.md`;
6. `00_VISION/CATEGORY.md`;
7. `03_ARCHITECTURE/AI_Architecture.md`;
8. `03_ARCHITECTURE/Data_Model.md`;
9. `LeaseMind_AI_MANAGER_ARCHITECTURE_v1.0(2).md`, версия 1.0, статус Approved.

GitHub, содержимое чатов, изображения интерфейсов и не приложенные документы не использовались как нормативные источники.

---

## 3. Неизменяемые границы

Эта спецификация MUST NOT:

- менять бизнес-модель;
- менять пользовательскую последовательность;
- менять экономику, Success Wallet или Escrow workflow;
- менять юридические правила;
- менять роль или полномочия AI Manager;
- создавать новую доменную сущность вместо `Property` или `TenantRequest`;
- разрешать AI самостоятельно менять подтверждённую цену, бюджет, аудиторию, локацию, срок или ключевые условия;
- разрешать автономные платежные или юридически значимые действия;
- разрешать раскрытие точного адреса без Address Disclosure Gate;
- превращать Техническое задание в объявление или публичный каталог.

Campaign остаётся главным объектом продукта. AI Manager остаётся оркестратором Campaign и работает только внутри подтверждённых пользователем коммерческих ограничений.

### 3.1. Нормативная пользовательская последовательность Sprint 4

Для обоих сценариев PRODUCT утверждает следующую обязательную последовательность:

```text
выбор роли
→ Technical Assignment
→ предварительный Analysis
→ Contacts
→ запуск Campaign
→ результат Campaign
```

Правила последовательности:

1. До готовности Technical Assignment переход к Analysis запрещён.
2. Analysis строится по валидной ревизии Technical Assignment и не создаёт активную Campaign.
3. До Contacts не запрашиваются и не сохраняются реальные персональные или контактные данные.
4. Прохождение Contacts не запускает Campaign автоматически.
5. Campaign создаётся только после отдельного подтверждения запуска.
6. После запуска AI Manager управляет Campaign в пределах подтверждённых ограничений.
7. Результат Campaign не является частью Technical Assignment.
8. Возврат назад и изменение задания создают новую ревизию и делают прежний Analysis устаревшим.

Эта последовательность является нормативной для реализации Sprint 4. `HOMEPAGE.md` и `FIRST_ANALYSIS.md` требуют отдельной редакционной синхронизации формулировок о моменте анализа; до такой синхронизации они не отменяют последовательность выше.

---

## 4. Термины и нормативные значения

| Термин | Значение |
| --- | --- |
| Техническое задание / `TechnicalAssignment` | Версионированный application-level payload, который валидируется и сохраняется в `Property` либо `TenantRequest`. Не является отдельной доменной сущностью из `Data_Model.md`. |
| Обязательное поле | Без валидного значения Техническое задание не считается готовым к передаче в соответствующую доменную сущность. |
| Необязательное поле | Отсутствие не блокирует дальнейший утверждённый пользовательский путь или запуск Campaign. |
| Жёсткое ограничение | Условие, которое AI Manager не вправе менять самостоятельно. |
| Мягкое предпочтение | Условие для ранжирования; его изменение также требует подтверждения пользователя, если оно было подтверждено как часть Campaign. |
| `commercial_data` | Коммерческие параметры объекта или потребности, не предназначенные для публичного раскрытия по умолчанию. |
| `protected_commercial_data` | Коммерческие данные с отдельным контролем доступа, маскированием и аудитом, включая точный адрес. |
| `public_reference_data` | Enum и справочники платформы, не относящиеся к конкретной Campaign. |
| `personal_data_forbidden` | Данные, которые не входят в payload Технического задания и должны быть отклонены или маршрутизированы в отдельно утверждённый контур. |

Этот документ задаёт продуктовую классификацию чувствительности, но не заменяет юридическую квалификацию данных. Окончательная юридическая классификация относится к компетенции LEGAL.

---

## 5. Общий контракт

### 5.1. Envelope

```yaml
schema_version: "1.0"
technical_assignment_id: uuid
scenario: need_tenant | need_property
revision: integer
lifecycle_status: draft | ready_for_analysis | campaign_started
payload: object
created_at: datetime
updated_at: datetime
```

| field_id | Смысл | Тип | Обяз. | Допустимые значения и валидация | Классификация | Назначение |
| --- | --- | --- | --- | --- | --- | --- |
| `schema_version` | Версия контракта | string | Да | Только `1.0` для этой версии; pattern `^1\.0$` | public_reference_data | Десериализация и миграция |
| `technical_assignment_id` | Корреляционный ID ТЗ | UUID | Да | RFC 9562 UUID; создаётся сервером; неизменяем | commercial_data | Audit и идемпотентность; не новая доменная сущность |
| `scenario` | Выбранный сценарий | enum | Да | `need_tenant`, `need_property`; после первого сохранения неизменяем | commercial_data | Выбор схемы payload |
| `revision` | Версия payload | integer | Да | 1..2147483647; увеличивается на 1 при изменении нормализованных данных | commercial_data | Защита от устаревшего анализа и конкурентных изменений |
| `lifecycle_status` | Состояние задания | enum | Да | `draft`, `ready_for_analysis`, `campaign_started`; вычисляется сервером, клиент не задаёт | commercial_data | Управление черновиком и переходами |
| `created_at` | Время создания | datetime | Да | RFC 3339 UTC; серверное; immutable | commercial_data | Audit |
| `updated_at` | Время последнего изменения | datetime | Да | RFC 3339 UTC; серверное; >= `created_at` | commercial_data | Audit и freshness |

### 5.2. Общие правила нормализации

1. Кодировка строк — UTF-8.
2. Пробелы в начале и конце удаляются.
3. Пустая строка считается отсутствующим значением.
4. Управляющие символы, HTML и исполняемый код запрещены.
5. Денежные значения хранятся целыми рублями без копеек.
6. Площадь, высота и мощность хранятся как decimal, максимум два знака после запятой.
7. Даты передаются как `YYYY-MM-DD`; системные времена — RFC 3339 UTC.
8. Массивы не содержат дубликатов.
9. Неизвестные enum отклоняются.
10. Свободный текст проходит DLP-проверку до сохранения.
11. Серверная валидация нормативна; клиентская валидация не может быть единственной защитой.

### 5.3. Lifecycle и сохранение черновика

1. Technical Assignment сохраняется как черновик с первого валидного отдельного поля.
2. `draft` допускает отсутствие обязательных полей, но каждое переданное значение обязано пройти type, enum, boundary и DLP-валидацию.
3. `ready_for_analysis` устанавливается сервером только после успешной проверки полного минимального набора и межполевых правил.
4. `campaign_started` устанавливается после успешного идемпотентного запуска Campaign и связывания с созданными ранее Property либо TenantRequest.
5. Переходы разрешены только `draft → ready_for_analysis → campaign_started`; изменение готового задания до запуска возвращает его в `draft` только при утрате обязательного значения, иначе оставляет `ready_for_analysis` с новой revision.
6. `campaign_started` не редактируется на месте. Изменение активной Campaign создаёт новую revision задания и проходит правила раздела 13.
7. Черновик не передаётся агентам, не используется для Analysis и не создаёт Campaign.
8. Срок хранения и удаления черновика определяется LEGAL и SECURITY отдельно; этот документ не устанавливает retention.

---

## 6. Общие enum

### 6.1. `property_type`

```text
retail_unit
office
warehouse
light_industrial
free_purpose
standalone_building
land
other
```

### 6.2. `property_condition`

```text
shell_and_core
requires_full_renovation
cosmetic_renovation
ready_to_use
```

### 6.3. `business_category`

```text
cafe
restaurant
grocery
non_food_retail
pharmacy
medical
beauty
fitness
education
office
warehouse
light_production
services
showroom
entertainment
other
any_legal_business
```

`any_legal_business` разрешён только в `property_allowed_business_categories`, только как единственное значение массива. Он запрещён для TenantRequest, excluded и target categories. Значение `other` требует соответствующего текстового уточнения.

### 6.4. `business_stage`

```text
new_business
operating
expansion
relocation
additional_location
```

### 6.5. `entrance_type`

```text
separate_street
separate_yard
shared
loading_only
none
```

### 6.6. `entrance_requirement`

```text
separate_required
separate_preferred
shared_allowed
no_preference
```

### 6.7. `property_feature`

```text
separate_entrance
display_windows
ventilation
air_conditioning
heating
water_supply
sewerage
signage_space
parking
loading_zone
access_24_7
security
elevator
freight_elevator
```

### 6.8. `location_priority`

```text
near_home
near_customers
city_center
near_metro
near_shopping_center
near_business_center
first_line
high_visibility
parking
loading_access
```

### 6.9. `access_mode`

```text
business_hours
extended_hours
access_24_7
by_agreement
```

### 6.10. `loading_access`

```text
none
small_vehicle
truck
loading_dock
```

### 6.11. `floor_option`

```text
basement
semi_basement
ground
first
upper
any
```

### 6.12. `deal_priority`

```text
fastest_deal
balanced
maximum_economics
counterparty_reliability
```

---

## 7. Сценарий `need_tenant` — «Мне нужен арендатор»

### 7.1. Назначение payload

Payload описывает коммерческий объект и подтверждённые ограничения собственника/представителя. После успешной валидации данные сохраняются в `Property`. Campaign получает ссылку на Property и нормализованный snapshot ограничений.

### 7.2. Поля Property

| field_id | Смысл | Тип | Обяз. | Ед. | Допустимые значения и валидация | Multi | Классификация |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `property_type` | Основной тип объекта | enum | Да | — | `property_type`; ровно одно значение | Нет | commercial_data |
| `property_type_other` | Уточнение иного типа объекта | string | Условно | — | Обязательно при `property_type=other`; иначе MUST быть `null`; 2..100 символов; DLP | Нет | commercial_data |
| `property_country_code` | Страна объекта | string | Да | — | Для MVP только `RU` | Нет | commercial_data |
| `property_region` | Регион | string | Да | — | 2..100 символов; буквы, цифры, пробел, дефис; без точного адреса | Нет | commercial_data |
| `property_city` | Город/населённый пункт | string | Да | — | 2..100 символов; принадлежит выбранному региону по справочнику | Нет | commercial_data |
| `property_districts` | Районы или укрупнённые зоны | array<string> | Нет | — | 0..5 значений; каждое 2..100 символов; без дублей | Да | commercial_data |
| `property_exact_address` | Точный адрес объекта | string | Нет | — | 5..300 символов; структурируется отдельным address service; не содержит имени, телефона или инструкции по раскрытию | Нет | protected_commercial_data |
| `property_area_sqm` | Общая сдаваемая площадь | decimal | Да | м² | 5..100000; максимум 2 знака после запятой | Нет | commercial_data |
| `property_floor` | Этаж объекта | integer | Нет | этаж | -5..200; для `land` MUST быть `null` | Нет | commercial_data |
| `property_total_floors` | Этажность здания | integer | Нет | этажей | 1..200; если floor > 0, то floor <= total_floors | Нет | commercial_data |
| `property_entrance_type` | Тип входа | enum | Нет | — | `entrance_type` | Нет | commercial_data |
| `property_condition` | Состояние/готовность | enum | Да | — | `property_condition` | Нет | commercial_data |
| `property_available_from` | Дата доступности | date | Да | дата | ISO date; при вводе не раньше текущей даты; не позднее +730 дней | Нет | commercial_data |
| `property_monthly_rent_rub` | Запрашиваемая базовая аренда | integer | Да | ₽/месяц | 1000..100000000; целое; не включает автоматически иные платежи | Нет | commercial_data |
| `property_operating_expenses_included` | Включены ли эксплуатационные расходы | boolean | Да | — | `true` или `false` | Нет | commercial_data |
| `property_utilities_included` | Включены ли коммунальные расходы | boolean | Да | — | `true` или `false` | Нет | commercial_data |
| `property_security_deposit_rub` | Требуемый обеспечительный платёж | integer | Нет | ₽ | 0..100000000; целое | Нет | commercial_data |
| `property_min_lease_months` | Минимальный срок аренды | integer | Нет | месяцев | 1..240 | Нет | commercial_data |
| `property_allowed_business_categories` | Допустимые категории деятельности | array<enum> | Да | — | `business_category`; 1..8; без дублей | Да | commercial_data |
| `property_excluded_business_categories` | Недопустимые категории деятельности | array<enum> | Нет | — | `business_category`; 0..8; без дублей; не пересекается с allowed | Да | commercial_data |
| `property_target_tenant_categories` | Предпочтительные категории арендаторов | array<enum> | Нет | — | `business_category`; 0..5; подмножество allowed | Да | commercial_data |
| `property_business_category_other` | Уточнение категории `other` | string | Условно | — | Обязательно, если `other` присутствует в allowed, excluded или target; иначе MUST быть `null`; 2..200 символов; DLP | Нет | commercial_data |
| `property_power_kw` | Доступная электрическая мощность | decimal | Нет | кВт | 0..10000; максимум 2 знака | Нет | commercial_data |
| `property_ceiling_height_m` | Минимальная высота потолка | decimal | Нет | м | 1.8..30; максимум 2 знака | Нет | commercial_data |
| `property_features` | Подтверждённые характеристики | array<enum> | Нет | — | `property_feature`; 0..14; без дублей | Да | commercial_data |
| `property_parking_spaces` | Доступное число парковочных мест | integer | Нет | мест | 0..10000 | Нет | commercial_data |
| `property_loading_access` | Возможность погрузки/разгрузки | enum | Нет | — | `loading_access` | Нет | commercial_data |
| `property_access_mode` | Доступный режим работы | enum | Нет | — | `access_mode` | Нет | commercial_data |
| `property_deal_priority` | Приоритет собственника | enum | Да | — | `deal_priority` | Нет | commercial_data |
| `property_additional_requirements` | Иные коммерческие условия | string | Нет | — | 0..2000 символов; DLP; без контактов, идентификаторов, платежных реквизитов и документов | Нет | commercial_data |

### 7.3. Минимально обязательный набор

Техническое задание `need_tenant` готово к преобразованию в Property только при наличии валидных:

```text
property_type
property_country_code
property_region
property_city
property_area_sqm
property_condition
property_available_from
property_monthly_rent_rub
property_operating_expenses_included
property_utilities_included
property_allowed_business_categories
property_deal_priority
```

Отсутствие любого другого поля MUST NOT блокировать утверждённый дальнейший путь.

### 7.4. Межполевые правила

1. `property_allowed_business_categories` и `property_excluded_business_categories` не пересекаются.
2. `property_target_tenant_categories` является подмножеством allowed.
3. `any_legal_business` разрешён только как единственное значение allowed; excluded и target при этом должны быть пустыми.
4. `other` требует `property_business_category_other`.
5. Для `property_type=land` поля floor, total_floors, ceiling_height и entrance_type должны быть `null`.
6. `property_floor` не может превышать `property_total_floors`, если оба значения положительные.
7. Наличие `parking` в features при `property_parking_spaces=0` является конфликтом.
8. Наличие `loading_zone` в features при `property_loading_access=none` является конфликтом.
9. Истёкшая после сохранения `property_available_from` не делает исторический payload невалидным; для анализа трактуется как «доступно сейчас».

---

## 8. Сценарий `need_property` — «Мне нужно помещение»

### 8.1. Назначение payload

Payload описывает коммерческую потребность потенциального арендатора и подтверждённые ограничения поиска. После успешной валидации данные сохраняются в `TenantRequest`. Campaign получает ссылку на TenantRequest и нормализованный snapshot ограничений.

### 8.2. Поля TenantRequest

| field_id | Смысл | Тип | Обяз. | Ед. | Допустимые значения и валидация | Multi | Классификация |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `request_business_category` | Категория бизнеса | enum | Да | — | `business_category` | Нет | commercial_data |
| `request_business_category_other` | Уточнение категории бизнеса | string | Условно | — | Обязательно при `request_business_category=other`; иначе MUST быть `null`; 2..200 символов; DLP | Нет | commercial_data |
| `request_business_stage` | Стадия бизнеса/причина поиска | enum | Да | — | `business_stage` | Нет | commercial_data |
| `request_expected_occupancy_people` | Ожидаемое число одновременно находящихся людей | integer | Нет | человек | 1..10000 | Нет | commercial_data |
| `request_country_code` | Целевая страна | string | Да | — | Для MVP только `RU` | Нет | commercial_data |
| `request_region` | Целевой регион | string | Да | — | 2..100 символов; буквы, цифры, пробел, дефис | Нет | commercial_data |
| `request_cities` | Целевые города | array<string> | Да | — | 1..5; каждое 2..100 символов; принадлежат региону; без дублей | Да | commercial_data |
| `request_districts` | Приемлемые районы/зоны | array<string> | Нет | — | 0..20; каждое 2..100 символов; принадлежит одному из выбранных городов | Да | commercial_data |
| `request_location_priorities` | Приоритеты локации | array<enum> | Нет | — | `location_priority`; 0..5; без дублей | Да | commercial_data |
| `request_property_types` | Приемлемые типы объектов | array<enum> | Да | — | `property_type`; 1..8; без дублей | Да | commercial_data |
| `request_property_type_other` | Уточнение иного типа объекта | string | Условно | — | Обязательно, если `other` присутствует в `request_property_types`; иначе MUST быть `null`; 2..100 символов; DLP | Нет | commercial_data |
| `request_area_min_sqm` | Минимальная площадь | decimal | Да | м² | 5..100000; <= area_max; максимум 2 знака | Нет | commercial_data |
| `request_area_max_sqm` | Максимальная площадь | decimal | Да | м² | 5..100000; >= area_min; максимум 2 знака | Нет | commercial_data |
| `request_monthly_budget_max_rub` | Максимальный бюджет базовой аренды | integer | Да | ₽/месяц | 1000..100000000; целое | Нет | commercial_data |
| `request_budget_includes_operating_expenses` | Включает ли бюджет эксплуатационные расходы | boolean | Да | — | `true` или `false` | Нет | commercial_data |
| `request_condition_options` | Приемлемые состояния объекта | array<enum> | Да | — | `property_condition`; 1..4; без дублей | Да | commercial_data |
| `request_move_in_by` | Крайняя желаемая дата въезда | date | Да | дата | ISO date; при вводе не раньше текущей даты; не позднее +730 дней | Нет | commercial_data |
| `request_min_lease_months` | Минимально приемлемый срок | integer | Нет | месяцев | 1..240 | Нет | commercial_data |
| `request_power_min_kw` | Минимальная мощность | decimal | Нет | кВт | 0..10000; максимум 2 знака | Нет | commercial_data |
| `request_ceiling_height_min_m` | Минимальная высота потолка | decimal | Нет | м | 1.8..30; максимум 2 знака | Нет | commercial_data |
| `request_entrance_requirement` | Требование к входу | enum | Нет | — | `entrance_requirement` | Нет | commercial_data |
| `request_floor_options` | Приемлемые этажи | array<enum> | Нет | — | `floor_option`; 0..5; `any` нельзя сочетать с другими | Да | commercial_data |
| `request_parking_min_spaces` | Минимум парковочных мест | integer | Нет | мест | 0..10000 | Нет | commercial_data |
| `request_loading_access_required` | Обязательна ли погрузка/разгрузка | boolean | Нет | — | `true` или `false` | Нет | commercial_data |
| `request_access_mode` | Требуемый режим доступа | enum | Нет | — | `access_mode` | Нет | commercial_data |
| `request_required_features` | Обязательные характеристики | array<enum> | Нет | — | `property_feature`; 0..10; без дублей | Да | commercial_data |
| `request_excluded_features` | Недопустимые характеристики | array<enum> | Нет | — | `property_feature`; 0..10; без дублей; не пересекается с required | Да | commercial_data |
| `request_deal_priority` | Приоритет арендатора | enum | Да | — | `deal_priority` | Нет | commercial_data |
| `request_additional_requirements` | Иные коммерческие требования | string | Нет | — | 0..2000 символов; DLP; без контактов, идентификаторов, платежных реквизитов и документов | Нет | commercial_data |

### 8.3. Минимально обязательный набор

Техническое задание `need_property` готово к преобразованию в TenantRequest только при наличии валидных:

```text
request_business_category
request_business_stage
request_country_code
request_region
request_cities
request_property_types
request_area_min_sqm
request_area_max_sqm
request_monthly_budget_max_rub
request_budget_includes_operating_expenses
request_condition_options
request_move_in_by
request_deal_priority
```

Отсутствие любого другого поля MUST NOT блокировать утверждённый дальнейший путь.

### 8.4. Межполевые правила

1. `request_area_min_sqm <= request_area_max_sqm`.
2. `request_required_features` и `request_excluded_features` не пересекаются.
3. `floor_option=any` нельзя сочетать с другими floor options.
4. `request_business_category=any_legal_business` запрещён.
5. Значение `other` требует соответствующего `*_other` уточнения.
6. `request_loading_access_required=true` является самостоятельным hard constraint; дублировать `loading_zone` в required features не требуется.
7. Истёкшая после сохранения `request_move_in_by` не делает исторический payload невалидным; AI Manager фиксирует просроченное ограничение и запрашивает решение пользователя, а не меняет дату самостоятельно.

---

## 9. Преобразование в Property и TenantRequest

### 9.1. Общие правила

1. `TechnicalAssignment` — входной контракт, а не новая сущность `Data_Model.md`.
2. `need_tenant.payload` атомарно валидируется и записывается в `Property`.
3. `need_property.payload` атомарно валидируется и записывается в `TenantRequest`.
4. Запись хранит `source_technical_assignment_id`, `source_schema_version` и `source_revision` для воспроизводимости.
5. Повтор с тем же idempotency key не создаёт дубликат Property или TenantRequest.
6. Невалидное обязательное поле блокирует преобразование.
7. Отсутствующее необязательное поле не блокирует преобразование или запуск Campaign.
8. Raw payload не должен дублироваться в логах.

### 9.2. Защищённый адрес

`property_exact_address`:

- сохраняется отдельно от общедоступной проекции Property;
- передаётся в Campaign только как `protected_address_ref`;
- не передаётся в обычный LLM-контекст;
- доступен только агенту/сервису с явным `data_access_scope`;
- не включается в Candidate, Match, уведомления, отчёты или исходящие действия без Address Disclosure Gate;
- каждое чтение подлежит неизменяемому аудиту.

---

## 10. Данные, передаваемые в Campaign

### 10.1. Контракт Campaign bootstrap

```yaml
campaign_goal:
  goal_type: find_tenant | find_property
subject_ref:
  entity_type: Property | TenantRequest
  entity_id: uuid
source_contract:
  technical_assignment_id: uuid
  schema_version: "1.0"
  revision: integer
subject_snapshot: object
hard_constraints: object
soft_preferences: object
strategy_preferences: object
protected_refs: object
```

Классификация блоков:

- `subject_snapshot` — факты об объекте или контекст бизнеса; они не являются разрешением AI менять данные;
- `hard_constraints` — условия исключения: Candidate, который им не соответствует, не может считаться квалифицированным;
- `soft_preferences` — условия ранжирования: несоответствие снижает приоритет, но не исключает Candidate;
- `strategy_preferences` — подтверждённый приоритет ведения Campaign; не является фильтром Candidate;
- `protected_refs` — ссылки на защищённое хранение без raw values.

### 10.2. Сценарий `need_tenant`

В Campaign передаются:

| Блок Campaign | Точное значение или `field_id` источника |
| --- | --- |
| `campaign_goal.goal_type` | Константа `find_tenant` |
| `subject_ref.entity_type` | Константа `Property` |
| `subject_ref.entity_id` | `Property.property_id` |
| `source_contract.*` | `technical_assignment_id`, `schema_version`, `revision` |
| `subject_snapshot.property_type` | `property_type` |
| `subject_snapshot.property_type_other` | `property_type_other`, если задано |
| `subject_snapshot.country_code` | `property_country_code` |
| `subject_snapshot.region` | `property_region` |
| `subject_snapshot.city` | `property_city` |
| `subject_snapshot.districts` | `property_districts`, если задано |
| `subject_snapshot.area_sqm` | `property_area_sqm` |
| `subject_snapshot.floor` | `property_floor`, если задано |
| `subject_snapshot.total_floors` | `property_total_floors`, если задано |
| `subject_snapshot.entrance_type` | `property_entrance_type`, если задано |
| `subject_snapshot.condition` | `property_condition` |
| `hard_constraints.available_from` | `property_available_from` |
| `hard_constraints.monthly_rent_rub` | `property_monthly_rent_rub` |
| `hard_constraints.operating_expenses_included` | `property_operating_expenses_included` |
| `hard_constraints.utilities_included` | `property_utilities_included` |
| `hard_constraints.security_deposit_rub` | `property_security_deposit_rub`, если задано |
| `hard_constraints.min_lease_months` | `property_min_lease_months`, если задано |
| `hard_constraints.allowed_business_categories` | `property_allowed_business_categories` |
| `hard_constraints.excluded_business_categories` | `property_excluded_business_categories`, если задано |
| `hard_constraints.business_category_other` | `property_business_category_other`, если задано |
| `subject_snapshot.power_kw` | `property_power_kw`, если задано |
| `subject_snapshot.ceiling_height_m` | `property_ceiling_height_m`, если задано |
| `subject_snapshot.features` | `property_features`, если задано |
| `subject_snapshot.parking_spaces` | `property_parking_spaces`, если задано |
| `subject_snapshot.loading_access` | `property_loading_access`, если задано |
| `subject_snapshot.access_mode` | `property_access_mode`, если задано |
| `hard_constraints.additional_requirements` | `property_additional_requirements`, если задано и прошло DLP |
| `soft_preferences.target_tenant_categories` | `property_target_tenant_categories`, если задано |
| `strategy_preferences.deal_priority` | `property_deal_priority` |
| `protected_refs.address` | Ссылка `protected_address_ref`, только если задан `property_exact_address`; raw address не передаётся |

Факты Property находятся только в `subject_snapshot`; коммерческие условия допуска арендатора находятся в `hard_constraints`. Ни один из блоков не даёт AI Manager права менять подтверждённые значения.

### 10.3. Сценарий `need_property`

В Campaign передаются:

| Блок Campaign | Точное значение или `field_id` источника |
| --- | --- |
| `campaign_goal.goal_type` | Константа `find_property` |
| `subject_ref.entity_type` | Константа `TenantRequest` |
| `subject_ref.entity_id` | `TenantRequest.tenant_request_id` |
| `source_contract.*` | `technical_assignment_id`, `schema_version`, `revision` |
| `subject_snapshot.business_category` | `request_business_category` |
| `subject_snapshot.business_category_other` | `request_business_category_other`, если задано |
| `subject_snapshot.business_stage` | `request_business_stage` |
| `subject_snapshot.expected_occupancy_people` | `request_expected_occupancy_people`, если задано |
| `hard_constraints.country_code` | `request_country_code` |
| `hard_constraints.region` | `request_region` |
| `hard_constraints.cities` | `request_cities` |
| `hard_constraints.districts` | `request_districts`, если задано |
| `hard_constraints.property_types` | `request_property_types` |
| `hard_constraints.property_type_other` | `request_property_type_other`, если задано |
| `hard_constraints.area_min_sqm` | `request_area_min_sqm` |
| `hard_constraints.area_max_sqm` | `request_area_max_sqm` |
| `hard_constraints.monthly_budget_max_rub` | `request_monthly_budget_max_rub` |
| `hard_constraints.budget_includes_operating_expenses` | `request_budget_includes_operating_expenses` |
| `hard_constraints.condition_options` | `request_condition_options` |
| `hard_constraints.move_in_by` | `request_move_in_by` |
| `hard_constraints.min_lease_months` | `request_min_lease_months`, если задано |
| `hard_constraints.power_min_kw` | `request_power_min_kw`, если задано |
| `hard_constraints.ceiling_height_min_m` | `request_ceiling_height_min_m`, если задано |
| `hard_constraints.entrance_requirement` | `request_entrance_requirement`, если задано |
| `hard_constraints.floor_options` | `request_floor_options`, если задано |
| `hard_constraints.parking_min_spaces` | `request_parking_min_spaces`, если задано |
| `hard_constraints.loading_access_required` | `request_loading_access_required`, если задано |
| `hard_constraints.access_mode` | `request_access_mode`, если задано |
| `hard_constraints.required_features` | `request_required_features`, если задано |
| `hard_constraints.excluded_features` | `request_excluded_features`, если задано |
| `hard_constraints.additional_requirements` | `request_additional_requirements`, если задано и прошло DLP |
| `soft_preferences.location_priorities` | `request_location_priorities`, если задано |
| `strategy_preferences.deal_priority` | `request_deal_priority` |
| `protected_refs` | Пустой object; контакты и защищённые данные не входят в этот контракт |

`request_property_types` является перечнем приемлемых типов, поэтому передаётся как hard constraint независимо от количества выбранных значений.

### 10.4. Правила AI Manager

1. Goal and Constraint Manager хранит подтверждённые ограничения.
2. AI Manager MAY анализировать, сравнивать, искать и ранжировать внутри этих границ.
3. AI Manager MUST NOT самостоятельно менять цену, бюджет, аудиторию, локацию, срок или ключевые условия.
4. Предложение изменить ограничение создаётся как Recommendation и проходит Human Decision Gateway.
5. Специализированные агенты получают только минимальный `data_access_scope`.
6. Агент не изменяет Campaign, Property или TenantRequest напрямую.
7. Результат агента не становится подтверждённым фактом без Evidence Validator.

---

## 11. Analysis и входы первичного анализа

### 11.1. Два момента расчёта

1. **Pre-launch Analysis** — обязательный экран после `ready_for_analysis` и до Contacts. Расчёт привязан к `technical_assignment_id + revision`; активная Campaign ещё не существует.
2. **Post-launch refresh** — перерасчёт после запуска Campaign, не позднее 15 минут, как установлено `FIRST_ANALYSIS.md`. Он использует ту же либо более свежую доказательную базу и становится первым analysis snapshot активной Campaign.

Оба расчёта имеют одинаковый состав результата. Post-launch refresh не добавляет новый пользовательский gate и не меняет последовательность раздела 3.1.

### 11.2. Состав и входы

Состав результата:

1. адекватность цены относительно рынка;
2. количество конкурентов;
3. вероятность сделки за 30 дней;
4. потенциальные категории арендаторов или объектов.

| Результат | `need_tenant` inputs | `need_property` inputs | AI-контур |
| --- | --- | --- | --- |
| Адекватность цены | type, укрупнённая локация, area, rent, included expenses, condition | business category, укрупнённая локация, property types, area range, budget, included expenses, condition options | Pricing Analyzer + Property/Demand Analyzer |
| Количество конкурентов | Аналогичные Property по типу, локации, площади, цене, состоянию | Аналогичные TenantRequest по категории, локации, площади и бюджету | Competition Analyzer |
| Вероятность сделки за 30 дней | Цена, конкуренция, доступность, состояние, допустимые категории, приоритет | Бюджет, конкуренция, срок, типы объектов, категория бизнеса, приоритет | Property/Demand Analyzer + Confidence Engine |
| Потенциальные категории | allowed/excluded/target categories и характеристики Property | business category, property types, location priorities, required/excluded features | Property/Demand Analyzer + Matching Engine |

Правила:

- точный адрес заменяется укрупнённой локацией или scoped reference;
- анализ не использует персональные данные;
- отсутствие данных возвращается как `missing_data` или `insufficient_data`, а не вымышленный результат;
- каждый значимый вывод содержит evidence, confidence и срок актуальности;
- результат является предварительной информационной оценкой;
- результат содержит `source_technical_assignment_id`, `source_revision`, `analysis_kind=pre_launch|post_launch_refresh` и `generated_at`;
- переход к Contacts разрешён только при завершённом pre-launch Analysis либо безопасном состоянии `insufficient_data`; техническая ошибка расчёта возвращает retryable error и не должна подменяться вымышленным результатом;
- post-launch refresh сохраняет установленный в `FIRST_ANALYSIS.md` срок 15 минут после запуска.

---

## 12. Персональные и запрещённые данные

### 12.1. Что не входит в Техническое задание

Payload обоих сценариев MUST NOT содержать:

1. имя, фамилию, отчество;
2. телефон, email, messenger handle или ссылку на личный аккаунт;
3. паспорт, СНИЛС, ИНН физического лица и иные идентификаторы;
4. банковские карты, счета, платежные токены и реквизиты;
5. пароли, API-ключи, access tokens и секреты;
6. подпись, биометрию или изображение документа;
7. контакты потенциальной второй стороны;
8. сведения о здоровье, семье, национальности, политических или религиозных взглядах;
9. документы о собственности, доверенности, договоры или выписки;
10. фотографии с идентифицируемыми людьми, номерами автомобилей, документами или контактами;
11. историю личной переписки;
12. любые перечисленные данные внутри свободного текста.

Такие данные не должны сохраняться в payload, Property, TenantRequest, Campaign Memory, Strategic Memory, Platform Pattern Memory, Audit Log или LLM-контекст.

### 12.2. Что запрещено автоматически считать персональными предпочтениями

Следующие поля являются параметрами конкретной коммерческой задачи и MUST NOT автоматически записываться в `User Decision Memory` как постоянные персональные предпочтения пользователя:

- цена или бюджет;
- район, город и локационные приоритеты;
- площадь;
- сроки;
- допустимые/исключённые категории бизнеса;
- характеристики объекта;
- приоритет конкретной сделки;
- свободные коммерческие требования.

Они MAY попасть в User Decision Memory только как явно подтверждённое пользователем повторно используемое предпочтение, после Memory Write Gate и с указанием источника, времени и срока актуальности.

### 12.3. Чувствительные, но не автоматически персональные поля

Продуктовая классификация не должна автоматически записывать следующие значения как `personal_data`:

- `property_exact_address` — `protected_commercial_data`;
- параметры Property — `commercial_data`;
- параметры TenantRequest — `commercial_data`;
- подтверждённые ограничения Campaign — `commercial_data`;
- платформенные enum — `public_reference_data`.

Если LEGAL установит, что конкретное значение в конкретном контексте является персональными данными, применяется более строгая юридическая классификация и отдельный контур хранения. PRODUCT и DEVELOPMENT не вправе понижать её самостоятельно.

### 12.4. DLP и поведение при нарушении

1. DLP применяется к каждому string и каждому загружаемому value до записи.
2. При обнаружении запрещённых данных поле отклоняется целиком.
3. Запрещённое raw value не сохраняется в БД, логах, telemetry или error body.
4. Ошибка возвращает только `field_id` и безопасный код.
5. Маскирование не является разрешением сохранять запрещённое значение в этом payload.

---

## 13. Обновление Технического задания

1. Каждое изменение нормализованных данных увеличивает `revision`.
2. Старая ревизия остаётся доступной для audit, но не используется как текущая.
3. Результаты анализа содержат `source_revision`.
4. Результат анализа другой ревизии считается `stale`.
5. При возврате из Analysis или Contacts и изменении задания прежний Analysis немедленно становится stale; пользователь возвращается на новый Analysis до запуска.
6. Уже полученное согласие/контактная запись не копируется в Technical Assignment и не удаляется из своего защищённого контура только из-за изменения коммерческого задания; применимость согласия проверяется отдельным Contacts Gate.
7. До запуска последняя `ready_for_analysis` revision является единственной допустимой основой Campaign bootstrap.
8. Команда запуска обязана ссылаться на revision, для которой завершён актуальный pre-launch Analysis и пройден Contacts Gate. Несовпадение блокирует запуск.
9. Если изменено подтверждённое ограничение активной Campaign, AI Manager не применяет его автоматически: создаётся Human Decision Gateway flow согласно утверждённой архитектуре.
10. После подтверждения изменения создаётся новая версия Campaign Context и соответствующее событие Audit Log.
11. Неизменённые нормализованные значения не создают новую revision.
12. Конкурентное обновление защищается optimistic concurrency по `revision`.
13. Изменение только серверного `lifecycle_status` создаёт audit event, но не увеличивает payload revision.

---

## 14. Каталог ошибок

| Код | Условие |
| --- | --- |
| `TECHNICAL_ASSIGNMENT_SCHEMA_UNSUPPORTED` | Неподдерживаемая `schema_version` |
| `TECHNICAL_ASSIGNMENT_SCENARIO_REQUIRED` | Отсутствует scenario |
| `TECHNICAL_ASSIGNMENT_SCENARIO_IMMUTABLE` | Попытка изменить scenario существующего ТЗ |
| `TECHNICAL_ASSIGNMENT_STATE_INVALID` | Операция запрещена для текущего lifecycle status |
| `TECHNICAL_ASSIGNMENT_REQUIRED_FIELD_MISSING` | Отсутствует обязательное поле |
| `TECHNICAL_ASSIGNMENT_FIELD_TYPE_INVALID` | Неверный тип |
| `TECHNICAL_ASSIGNMENT_FIELD_VALUE_INVALID` | Неверный enum, формат или граница |
| `TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT` | Нарушена межполевая зависимость |
| `TECHNICAL_ASSIGNMENT_PERSONAL_DATA_FORBIDDEN` | Обнаружены запрещённые персональные/контактные данные |
| `TECHNICAL_ASSIGNMENT_SECRET_FORBIDDEN` | Обнаружен секрет или платежный credential |
| `TECHNICAL_ASSIGNMENT_REVISION_CONFLICT` | Конкурентное обновление устаревшей ревизии |
| `TECHNICAL_ASSIGNMENT_ANALYSIS_STALE` | Анализ относится к другой ревизии |
| `TECHNICAL_ASSIGNMENT_ANALYSIS_REQUIRED` | Для текущей ревизии отсутствует завершённый pre-launch Analysis |
| `TECHNICAL_ASSIGNMENT_CONTACTS_GATE_REQUIRED` | Не пройден обязательный Contacts Gate |
| `TECHNICAL_ASSIGNMENT_PROTECTED_SCOPE_REQUIRED` | Попытка чтения protected address без scope |

Error response MUST содержать:

```yaml
code: string
field_id: string | null
message: safe_string
correlation_id: string
```

Error response MUST NOT повторять запрещённое входное значение.

---

## 15. Acceptance-сценарии `need_tenant`

### `CTA-L-001` — минимально валидный Property

**Given:** scenario=`need_tenant`.  
**When:** заполнены все поля раздела 7.3.  
**Then:** payload валиден и может быть идемпотентно преобразован в один Property.

### `CTA-L-002` — отсутствует обязательная цена

**When:** отсутствует `property_monthly_rent_rub`.  
**Then:** преобразование блокируется; возвращается required-field error с этим `field_id`.

### `CTA-L-003` — необязательное поле отсутствует

**When:** отсутствуют power, ceiling, parking или exact address.  
**Then:** payload остаётся валидным; отсутствие не блокирует дальнейший путь.

### `CTA-L-004` — конфликт категорий

**When:** одна категория указана одновременно в allowed и excluded.  
**Then:** payload отклоняется с cross-field error.

### `CTA-L-005` — защищённый адрес

**When:** передан валидный `property_exact_address`.  
**Then:** raw address сохраняется в protected storage; в Campaign передаётся только reference.

### `CTA-L-006` — персональные данные в комментарии

**When:** additional requirements содержат телефон, email или имя.  
**Then:** поле отклоняется до записи; raw value отсутствует в БД и логах.

### `CTA-L-007` — изменение цены

**Given:** существует ревизия N и относящийся к ней анализ.  
**When:** цена изменена.  
**Then:** создаётся N+1; старый анализ помечается stale.

### `CTA-L-008` — AI предлагает изменение ограничения

**When:** Pricing Analyzer рекомендует снизить цену.  
**Then:** цена не изменяется автоматически; создаётся Recommendation и запрос решения человеку.

### `CTA-L-009` — повтор команды

**When:** повторяется преобразование с тем же idempotency key.  
**Then:** второй Property не создаётся.

### `CTA-L-010` — запрет раскрытия адреса

**When:** агент без protected scope запрашивает raw address.  
**Then:** доступ запрещён, попытка записана в Audit Log.

---

## 16. Acceptance-сценарии `need_property`

### `CTA-T-001` — минимально валидный TenantRequest

**Given:** scenario=`need_property`.  
**When:** заполнены все поля раздела 8.3.  
**Then:** payload валиден и может быть идемпотентно преобразован в один TenantRequest.

### `CTA-T-002` — отсутствует максимальный бюджет

**When:** отсутствует `request_monthly_budget_max_rub`.  
**Then:** преобразование блокируется; возвращается required-field error.

### `CTA-T-003` — необязательное поле отсутствует

**When:** отсутствуют occupancy, power, ceiling, parking или districts.  
**Then:** payload остаётся валидным; отсутствие не блокирует дальнейший путь.

### `CTA-T-004` — неверный диапазон площади

**When:** area_min > area_max.  
**Then:** payload отклоняется с cross-field error.

### `CTA-T-005` — неуточнённое значение other

**When:** `request_business_category=other`, но `request_business_category_other` отсутствует.  
**Then:** payload отклоняется с required-field error для условного поля.

### `CTA-T-006` — конфликт required/excluded

**When:** одна feature присутствует в обоих массивах.  
**Then:** payload отклоняется.

### `CTA-T-007` — контакты в свободном тексте

**When:** additional requirements содержат телефон, email, messenger или ссылку на профиль.  
**Then:** значение отклоняется и не сохраняется.

### `CTA-T-008` — изменение бюджета активной Campaign

**When:** AI предлагает увеличить budget.  
**Then:** бюджет не изменяется автоматически; требуется решение человека.

### `CTA-T-009` — stale analysis

**Given:** analysis относится к revision N.  
**When:** location или area изменены и создана revision N+1.  
**Then:** analysis N не используется как актуальный.

### `CTA-T-010` — повтор команды

**When:** повторяется преобразование с тем же idempotency key.  
**Then:** второй TenantRequest не создаётся.

### `CTA-C-001` — сохранение неполного черновика

**Given:** передано хотя бы одно валидное поле, но минимальный набор неполон.  
**When:** пользователь сохраняет задание.  
**Then:** создаётся или обновляется `draft`; Property/TenantRequest, Analysis и Campaign не создаются.

### `CTA-C-002` — невалидное значение в черновике

**When:** черновик содержит неизвестный enum, значение вне границы или запрещённые данные.  
**Then:** конкретное изменение отклоняется; невалидное raw value не сохраняется.

### `CTA-C-003` — переход к Analysis

**Given:** lifecycle=`ready_for_analysis`.  
**When:** запускается pre-launch Analysis.  
**Then:** analysis содержит тот же `technical_assignment_id` и `revision`; Campaign не создаётся.

### `CTA-C-004` — изменение после Analysis

**Given:** Analysis готов для revision N.  
**When:** пользователь возвращается и меняет нормализованное поле.  
**Then:** создаётся revision N+1, Analysis N становится stale, переход к запуску блокируется до нового Analysis.

### `CTA-C-005` — попытка запуска без Contacts

**Given:** актуальный Analysis готов, Contacts Gate не пройден.  
**When:** запрошен запуск.  
**Then:** Campaign не создаётся; возвращается `TECHNICAL_ASSIGNMENT_CONTACTS_GATE_REQUIRED`.

### `CTA-C-006` — успешный запуск

**Given:** задание ready, Analysis соответствует текущей revision, Contacts Gate пройден.  
**When:** пользователь отдельно подтверждает запуск.  
**Then:** идемпотентно создаётся одна Campaign, lifecycle становится `campaign_started`, запускается post-launch refresh.

---

## 17. Нефункциональные требования

1. Полная изоляция данных разных пользователей, организаций и Campaign.
2. Валидация на API и уровне хранения должна быть эквивалентной.
3. Все изменения и преобразования имеют correlation ID и Audit Log.
4. Raw payload, exact address, secrets и отклонённые значения не пишутся в application logs.
5. `technical_assignment_id + revision` однозначно определяют вход анализа.
6. Все agent tasks получают только минимально необходимый data scope.
7. Evidence Validator проверяет источник, свежесть и непротиворечивость результата.
8. Memory Write Gate отделяет факты, допущения и пользовательские решения.
9. Platform Pattern Memory не содержит персональных данных, точных адресов или данных, позволяющих восстановить конкретную Campaign.
10. Ошибка одного необязательного анализатора не должна блокировать независимые ветви Campaign.

---

## 18. Вопросы для cross-functional review

### 18.1. Решения PRODUCT по итоговой проверке

PRODUCT принимает в пределах своей компетенции:

1. состав, обязательность и условную обязательность полей Property из раздела 7;
2. состав, обязательность и условную обязательность полей TenantRequest из раздела 8;
3. enum, числовые границы, размеры массивов, нормализацию и cross-field rules разделов 5–8;
4. сохранение неполного задания как `draft` и lifecycle раздела 5.3;
5. последовательность раздела 3.1;
6. продуктовую семантику `subject_snapshot`, `hard_constraints`, `soft_preferences` и `strategy_preferences` раздела 10;
7. revision, stale analysis и возврат назад по разделу 13;
8. продуктовый состав error catalog и acceptance-сценариев разделов 14–16.

Эти решения составляют PRODUCT approval данной редакции, но не изменяют общий статус документа и не заменяют заключения других функций.

### 18.2. Единый реестр замечаний PRODUCT

| Раздел | Требуемое решение или изменение | Владелец | Критичность | Состояние в этой редакции |
| --- | --- | --- | --- | --- |
| 3.1, 11 | Зафиксировать pre-launch Analysis в утверждённой последовательности и отдельно сохранить post-launch refresh ≤15 минут | PRODUCT; редакционная синхронизация `HOMEPAGE.md`/`FIRST_ANALYSIS.md` — PRODUCT | Blocking | Исправлено в этом документе; синхронизация связанных документов остаётся обязательной |
| 5.1, 5.3 | Добавить серверный lifecycle и возможность безопасно сохранять неполный draft | PRODUCT / DEVELOPMENT | Blocking | Продуктовое решение принято; реализация требует проверки DEVELOPMENT |
| 6–8 | Убрать смешение типа помещения и назначения, добавить условные уточнения `other`, определить `any_legal_business` | PRODUCT | Blocking | Исправлено и принято PRODUCT |
| 8.2, 8.4 | Удалить не обоснованные продуктом `budget_min` и ratio площади 20:1; устранить дублирование loading requirement | PRODUCT | Blocking | Исправлено и принято PRODUCT |
| 10 | Не передавать факты Property как hard constraints; дать точный field-level mapping четырёх семантических блоков | PRODUCT / AI / DEVELOPMENT | Blocking | Продуктовая семантика принята; технический и AI-контракт требуют заключений владельцев |
| 13 | Связать запуск с текущей revision, актуальным Analysis и Contacts Gate | PRODUCT / DEVELOPMENT | Blocking | Продуктовое решение принято; атомарность требует проверки DEVELOPMENT |
| 14–16 | Добавить lifecycle/gate errors и сквозные acceptance-сценарии | PRODUCT / DEVELOPMENT | Blocking | Продуктовый состав принят; исполнимость тестов требует проверки DEVELOPMENT |
| 7–8 | После пилота проверить числовые пределы и размеры массивов по telemetry без ослабления текущей серверной валидации | PRODUCT | Non-blocking | Отложено до появления синтетических/пилотных наблюдений |

### 18.3. Решения, которые PRODUCT не утверждает

Следующие пункты остаются на cross-functional review:

1. **AI:** исполнимость входов анализаторов, evidence/confidence contract и использование новых Campaign blocks.
2. **DEVELOPMENT:** envelope, lifecycle persistence, идемпотентность, optimistic concurrency, атомарный bootstrap и исполнимость acceptance tests.
3. **SECURITY:** protected storage, `protected_address_ref`, DLP, scopes, audit и запрет raw values в logs/telemetry.
4. **LEGAL:** окончательная квалификация данных, правовые основания, retention/deletion и правила Contacts Gate.
5. **AI + LEGAL + SECURITY:** допустимый scope специализированных агентов и Memory Write Gate.

Ни один пункт раздела 18.3 не считается утверждённым PRODUCT или публикацией версии 1.0.

---

## 19. Статус документа

**Proposal for cross-functional review and approval.**

**Итог PRODUCT:** APPROVED WITH NON-BLOCKING COMMENTS.

PRODUCT approval относится только к решениям раздела 18.1 и к полной текущей редакции файла. Документ остаётся Proposal до отдельных заключений AI, DEVELOPMENT, LEGAL и SECURITY. Реализация в production и изменение утверждённых документов до завершения cross-functional review не разрешаются этим документом автоматически.
