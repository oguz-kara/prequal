# Prequal — Spec (v1, 2026-08-30)

Portfolio project #1 (strateji: upwork-strategy repo, Bölüm 04/10/11).

## Persona (kurgusal)

Outbound/lead-gen ajansı, 6–10 kişi, 8–12 B2B SaaS müşterisi, her müşterinin
ICP'si farklı. Tetik: enrichment platformu kredileri ayın 3. haftasında
bitiyor; bir müşteri HubSpot'a düşen "HOT" lead'lerin mevcut fırsatların
kopyası olduğundan şikâyetçi. Demo markaları kurgusal; kartlarda "personal
build" notu zorunlu.

## Kapsam

**v1 — çekirdek akış**
- [x] Batch CSV işleme: `npm run batch` (`scripts/batch.mts`, --limit/--client
      bayrakları, ölçüm özeti) — UI'dan CSV yükleme v3'e kaldı
- [x] ICP dokümanı: `data/icp/<client>.md` (`lib/icp.ts`)
- [x] Skor çekirdeği + endpoint: `lib/score.ts` + `POST /api/score` —
      `{score 0-10, fit, signal, timing, opener}` (Zod), tier kod tarafında
- [x] Eşikler: ≥7 HOT · 4–6 REVIEW · ≤3 COLD (`tierFor`)
- [x] Lead store v1: `data/out/leads.json` dosya tabanlı (`lib/store.ts`) —
      Postgres'e geçiş v2'de (HubSpot + dashboard ile birlikte)
- [ ] İlk gerçek ölçüm koşusu (gerçek EXA + ANTHROPIC anahtarlarıyla,
      20 domain) → README "Measured" bölümüne

**v2 — entegrasyonlar**
- [ ] HubSpot upsert: contact/company/open-deal kontrolü → update-or-create
- [ ] HOT-only enrichment adımı (stub → gerçek sağlayıcı opsiyonel)
- [ ] Slack webhook: HOT alert + önerilen açılış cümlesi
- [ ] n8n workflow (`n8n/prequal.json`): inbound form → skor → yönlendirme
      (taban: n8n template #15418, kaynak README'de kredilendirilir)

**v3 — dashboard (omurga)**
- [ ] Müşteri başına: işlenen lead, HOT oranı, HOT başına enrichment çağrısı,
      override oranı
- [ ] (Omurga Kiranism starter'a taşınırsa bu sayfalar oraya göçer)

**Teknik borç (tabandan):** ~~API route'lar Exa client'ını modül yüklenirken
kuruyordu~~ → 2026-08-30'da 18 route handler-içi (lazy) kuruluma çevrildi;
build artık anahtarsız geçiyor.

**Kapsam dışı:** auth (demo basic-auth yeter), e-posta gönderimi, çoklu
workspace, gerçek müşteri verisi.

## Ölçüm protokolü (dürüst metrik)

- `data/test-domains.csv` (20 gerçek, halka açık şirket domain'i) sabit test
  seti; her koşuda: lead başına uçtan uca süre, Claude token maliyeti,
  enrichment çağrı sayısı (hedef: yalnız HOT), HubSpot sandbox'ta kopya
  fırsat sayısı (hedef 0).
- Rakamlar README "Measured" bölümüne koşu tarihiyle yazılır. Uydurma
  müşteri-çıktısı rakamı yazılmaz (Bölüm 01/04 kuralı).

## Portfolyo varlıkları (3 kart)

1. Ekran görüntüsü: dashboard (HOT oranı, kredi/lead) — omurga tasarım dili
2. Mimari diyagram: CSV/form → Exa → Claude → HubSpot dedupe → Slack
3. Loom (1–2 dk): ICP dokümanı → skor gerekçesi → dedupe kodu anlatımı
   (yalnız kendi yazdığım kod)

## Attribution

Base: exa-labs/company-researcher (MIT, LICENSE korunur). n8n routing
iskeleti: n8n.io template #15418 (WeblineIndia) — README'de kredilendirilir.
