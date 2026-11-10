# Storage & Persistence Schema — CoffeeApp (Calc Coffee)

## 1. Persistência Local (Offline-First)
Os dados do usuário residem exclusivamente no navegador via `LocalStorage` e `IndexedDB`:

### 1.1. Chaves de `LocalStorage`
- `calc_coffee_last_method`: String com o ID do último método utilizado (`v60`, `koar`, etc.).
- `calc_coffee_custom_ratios`: JSON com proporções personalizadas por método salvas pelo usuário.
- `calc_coffee_preferences`: Preferências de áudio (bip sonoro ativado, volume da fala, velocidade da voz).

### 1.2. IndexedDB (`CoffeeAppDB`)
- **Store `brew_history`**:
  - `id` (Auto-increment, PK)
  - `timestamp` (ISO string)
  - `method` (String)
  - `dose_grams` (Float)
  - `water_ml` (Float)
  - `duration_seconds` (Integer)
  - `sensory_rating` (Integer: 1 a 5)
  - `notes` (String)
