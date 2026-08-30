# n8n workflow — Prequal Inbound Lead Qualification

`prequal.json`: inbound form webhook → Prequal `/api/score` (Claude skorlama;
HOT'ta Slack + HubSpot senkronu uygulama tarafında koşar) → tier'a göre dal:
HOT / REVIEW (insan kuyruğu) / COLD (yalnız log).

Routing iskeleti n8n.io community template **#15418** (WeblineIndia, "Qualify
and route high-intent leads") fikrinin uyarlamasıdır; skorlama Claude'lu
Prequal endpoint'ine taşındı, Airtable yerine Prequal lead store + HubSpot
dedupe kullanılır.

## Kurulum (self-hosted, Docker)

```bash
docker run -it --rm -p 5678:5678 -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
```

1. `localhost:5678` → ilk kullanıcıyı oluştur.
2. Workflows → **Import from File** → `n8n/prequal.json`.
3. Prequal dev server'ı çalışıyor olmalı (`npm run dev`, port 3000).
   Node'daki URL `host.docker.internal:3000` (macOS/Windows Docker → host'a
   erişim; Linux'ta `--add-host=host.docker.internal:host-gateway` ekle).
4. Workflow'u **Active** yap ya da "Listen for test event" ile test et.

## Test

```bash
curl -X POST http://localhost:5678/webhook-test/prequal-lead \
  -H 'Content-Type: application/json' \
  -d '{"domain": "cal.com", "client": "acme-crm"}'
```

`PREQUAL_MOCK=1` ile kredi harcamadan çalışır; canvas'ta dallanmayı görürsün
(cal.com mock'ta HOT çıkar → HOT dalı). Aktif moddaysa URL `webhook/...`
(test'siz) olur.
