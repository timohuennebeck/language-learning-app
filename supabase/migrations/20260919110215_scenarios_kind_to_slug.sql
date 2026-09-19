-- 0009 · scenarios.kind → slug (the language-neutral situation id: 'cafe', 'hotel', …)
drop view public.scenario_content_gaps;
alter table public.scenarios rename column kind to slug;
alter table public.scenarios rename constraint scenarios_kind_language_key to scenarios_slug_language_key;

create view public.scenario_content_gaps with (security_invoker = true) as
with locales as (select code from public.languages where is_app_language),
     slugs as (select distinct slug from public.scenarios)
select k.slug, l.code as language, 'missing variant' as gap
from slugs k cross join (select code from public.languages where learnable) l
left join public.scenarios s on s.slug = k.slug and s.language = l.code
where s.id is null
union all
select s.slug, s.language, 'subtitle lacks ' || loc.code
from public.scenarios s cross join locales loc
where not (s.subtitle ? loc.code)
union all
select s.slug, s.language, 'brief lacks ' || loc.code
from public.scenarios s cross join locales loc
where not (s.brief ? loc.code)
union all
select s.slug, s.language, 'task ' || (t ->> 'id') || ' lacks ' || loc.code
from public.scenarios s, jsonb_array_elements(s.tasks) t cross join locales loc
where not ((t -> 'text') ? loc.code);
