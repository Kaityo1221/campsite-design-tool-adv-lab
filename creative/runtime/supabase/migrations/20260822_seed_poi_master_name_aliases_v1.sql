-- POI Master実データから抽出した高確度語彙を、既存alias_masterへ追加する。
-- 新しい辞書テーブルは作らない。
-- プレースホルダ（追加ポケスト1等）や曖昧語は対象外。

with seed(alias_id,dictionary_id,canonical_name,alias_name,normalized_alias) as (
  values
    ('ALIAS_PM_V1_PICNIC_TABLE','REST_BENCH','ベンチ','ピクニックテーブル','ピクニックテーブル'),
    ('ALIAS_PM_V1_FUWA_DOME','FAM_PLAYGROUND','遊具','ふわふわドーム','ふわふわドーム'),
    ('ALIAS_PM_V1_TRAIL_MARKER','LOOP_083','道標','トレイルマーカー','トレイルマーカー'),
    ('ALIAS_PM_V1_GUIDE_POLE','DISC_056','案内標柱','案内ポール','案内ポール'),
    ('ALIAS_PM_V1_TRAM_STOP','TRANSIT_007','停留所','電停','電停'),
    ('ALIAS_PM_V1_SUINKUTSU','NATURE_WATER','水辺','水琴窟','水琴窟'),
    ('ALIAS_PM_V1_CASCADE_JP','NATURE_051','滝','カスケード','カスケード'),
    ('ALIAS_PM_V1_CASCADE_EN','NATURE_051','滝','cascade','cascade'),
    ('ALIAS_PM_V1_WATERFALL_EN','NATURE_051','滝','waterfall','waterfall'),
    ('ALIAS_PM_V1_KOFUN','DISC_014','史跡','古墳','古墳'),
    ('ALIAS_PM_V1_CLOCK_TOWER','DISC_100','ランドマーク','時計塔','時計塔'),
    ('ALIAS_PM_V1_CLOCK_DAI','DISC_100','ランドマーク','時計台','時計台'),
    ('ALIAS_PM_V1_GUIDE_MAP','LOOP_073','案内図','案内地図','案内地図'),
    ('ALIAS_PM_V1_GUIDE_TYPO','DISC_SIGNBOARD','案内板','案内版','案内版')
)
insert into alias_master(
  alias_id,dictionary_id,canonical_name,alias_name,normalized_alias,
  match_type,source_type,review_status,active,note
)
select
  s.alias_id,s.dictionary_id,s.canonical_name,s.alias_name,s.normalized_alias,
  'contains','poi_master_seed_v1','approved_seed',true,
  'POI Master実データから抽出した高確度語彙。2026-08-22 v1'
from seed s
where not exists (
  select 1
  from alias_master a
  where lower(replace(a.normalized_alias,' ','')) = lower(replace(s.normalized_alias,' ',''))
    and a.active is distinct from false
);
