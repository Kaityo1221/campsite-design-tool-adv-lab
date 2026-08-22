-- POI Master -> existing name dictionary growth pipeline v2
-- Does not auto-write dictionary_master/alias_master.
-- It only mines and grades candidates for later review/adoption.

create or replace view public.poi_master_dictionary_candidates_v1 as
with master_names as (
  select
    m.normalized_name,
    min(m.canonical_name) as sample_name,
    sum(greatest(coalesce(m.seen_count,1),1))::bigint as seen_total,
    count(*)::bigint as master_rows,
    min(m.sample_lat) as sample_lat,
    min(m.sample_lng) as sample_lng
  from public.campsite_poi_master m
  where m.active is distinct from false
    and coalesce(trim(m.normalized_name),'') <> ''
  group by m.normalized_name
), uncovered as (
  select mn.*
  from master_names mn
  where not exists (
    select 1 from public.dictionary_master d
    where d.active is distinct from false
      and length(coalesce(d.normalized_name,'')) >= 2
      and mn.normalized_name ilike '%' || d.normalized_name || '%'
  )
  and not exists (
    select 1 from public.alias_master a
    where a.active is distinct from false
      and length(coalesce(a.normalized_alias,'')) >= 2
      and mn.normalized_name ilike '%' || a.normalized_alias || '%'
  )
), tagged as (
  select
    u.*,
    hrs.inferred_category as human_category,
    hrs.confidence_score as human_confidence,
    hrs.unanimous_human_signal,
    case
      when u.normalized_name ~* '(ここに|追加ポケスト|追加ジム|追加poi|新規poi|名称不明|不明poi|dummy|ダミー|test|テスト)' then 'placeholder'
      when u.normalized_name ~ '^[0-9０-９[:space:][:punct:]]+$' then 'numeric_or_symbol'
      when length(regexp_replace(u.normalized_name,'[[:space:][:punct:]]','','g')) < 2 then 'too_short'
      else null
    end as excluded_reason
  from uncovered u
  left join public.poi_name_review_signal_v1 hrs using(normalized_name)
)
select
  normalized_name,
  sample_name,
  seen_total,
  master_rows,
  sample_lat,
  sample_lng,
  human_category,
  human_confidence,
  unanimous_human_signal,
  excluded_reason,
  case
    when excluded_reason is not null then 'C'
    when unanimous_human_signal is true and coalesce(human_confidence,0) >= 90 then 'A'
    when seen_total >= 10 then 'B'
    else 'C'
  end as candidate_grade
from tagged;

create or replace view public.poi_master_dictionary_term_candidates_v2 as
with base as (
  select normalized_name, sample_name, seen_total
  from public.poi_master_dictionary_candidates_v1
  where excluded_reason is null
), suffixes as (
  select
    b.normalized_name,
    b.sample_name,
    b.seen_total,
    right(b.normalized_name, gs.n) as candidate_term,
    gs.n as term_length,
    case when char_length(b.normalized_name) > gs.n
      then substr(b.normalized_name, char_length(b.normalized_name)-gs.n, 1)
      else '' end as preceding_char
  from base b
  cross join lateral generate_series(2, least(12, char_length(b.normalized_name))) as gs(n)
), filtered as (
  select s.*
  from suffixes s
  where trim(s.candidate_term) = s.candidate_term
    and s.candidate_term !~* '(ここに|追加ポケスト|追加ジム|名称不明|dummy|ダミー|test|テスト|の範囲$)'
    and s.candidate_term !~ '^[0-9０-９[:space:][:punct:]]+$'
    and s.candidate_term !~ '^[のはがをにへとでや・ー々]'
    and s.candidate_term not in ('公園','広場','入口','出口','東口','西口','南口','北口','中央','案内','施設','記念','跡地','範囲')
    and (
      s.candidate_term !~* '^[a-z][a-z0-9 .&''-]*$'
      or s.preceding_char = ''
      or s.preceding_char !~* '[a-z0-9]'
    )
    and (
      s.candidate_term !~ '^[ァ-ヶー]+$'
      or char_length(s.candidate_term) >= 4
    )
    and s.candidate_term !~ '^[ーァィゥェォッャュョヮヵヶン]'
    and not exists (
      select 1 from public.dictionary_master d
      where d.active is distinct from false
        and lower(coalesce(d.normalized_name,'')) = lower(s.candidate_term)
    )
    and not exists (
      select 1 from public.alias_master a
      where a.active is distinct from false
        and lower(coalesce(a.normalized_alias,'')) = lower(s.candidate_term)
    )
), agg as (
  select
    candidate_term,
    count(distinct normalized_name)::bigint as distinct_name_count,
    sum(seen_total)::bigint as seen_total,
    min(sample_name) as sample_name,
    max(term_length) as term_length
  from filtered
  group by candidate_term
), dedup as (
  select a.*
  from agg a
  where not exists (
    select 1
    from agg longer
    where char_length(longer.candidate_term) > char_length(a.candidate_term)
      and right(longer.candidate_term, char_length(a.candidate_term)) = a.candidate_term
      and longer.distinct_name_count = a.distinct_name_count
      and longer.seen_total = a.seen_total
  )
), reviewed as (
  select
    f.candidate_term,
    m.review_category,
    count(distinct m.normalized_name)::bigint as reviewed_names
  from filtered f
  join public.campsite_poi_master m
    on m.active is distinct from false
   and m.normalized_name = f.normalized_name
   and m.review_category is not null
  where m.review_category in ('REST','STAY','LOOP','CAUTION','EXCLUDE','HOLD')
  group by f.candidate_term, m.review_category
), review_totals as (
  select
    candidate_term,
    sum(reviewed_names)::bigint as reviewed_name_count,
    max(reviewed_names)::bigint as dominant_review_count
  from reviewed
  group by candidate_term
), dominant as (
  select distinct on (r.candidate_term)
    r.candidate_term,
    r.review_category as suggested_category,
    r.reviewed_names
  from reviewed r
  order by r.candidate_term, r.reviewed_names desc, r.review_category
)
select
  d.candidate_term,
  d.distinct_name_count,
  d.seen_total,
  d.sample_name,
  d.term_length,
  coalesce(rt.reviewed_name_count,0) as reviewed_name_count,
  dom.suggested_category,
  case when coalesce(rt.reviewed_name_count,0) > 0
    then round((rt.dominant_review_count::numeric / rt.reviewed_name_count::numeric) * 100)::int
    else null end as review_consensus_pct,
  case
    when coalesce(rt.reviewed_name_count,0) >= 2
      and rt.dominant_review_count = rt.reviewed_name_count
      and dom.suggested_category in ('REST','STAY','LOOP','CAUTION')
      then 'A'
    when d.distinct_name_count >= 5 and d.seen_total >= 20 then 'B'
    when d.distinct_name_count >= 3 and d.seen_total >= 8 then 'B'
    else 'C'
  end as candidate_grade
from dedup d
left join review_totals rt using(candidate_term)
left join dominant dom using(candidate_term)
where d.distinct_name_count >= 2
order by
  case
    when coalesce(rt.reviewed_name_count,0) >= 2 and rt.dominant_review_count = rt.reviewed_name_count and dom.suggested_category in ('REST','STAY','LOOP','CAUTION') then 1
    when d.distinct_name_count >= 3 and d.seen_total >= 8 then 2
    else 3
  end,
  d.distinct_name_count desc,
  d.seen_total desc,
  d.term_length asc;
