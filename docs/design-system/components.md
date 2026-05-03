# Component reference

Quick reference. For full prop type signatures, see the per-component `.tsx` source. For visual variants, see Storybook.

## Button

The primary tap target. Pill-radius mint-green CTA throughout the wireframes.

| Variant | When to use |
|---|---|
| `primary` (default) | The main action on a screen — Start Reading, Save Profile, Connect a Smart Boot. |
| `secondary` | Supporting action — View Profile, Cancel, Skip. |
| `ghost` | Inline / "more" actions where outline would be too heavy. |
| `danger` | Destructive — Delete Account, Archive Horse. |

Sizes: `sm` (40 px) / `md` (48 px, default) / `lg` (56 px). All ≥ 44 pt for hit target.

States: `disabled` (40% opacity, pointer-events none), `loading` (spinner replaces label, `accessibilityState.busy=true`).

```tsx
<Button onPress={startScan}>Start Reading</Button>
<Button variant="secondary" size="sm">View Profile</Button>
<Button variant="danger" loading>Deleting…</Button>
```

## Pill

Small status indicator. The visual primitive for *any* "status with color" usage.

| Intent | Use |
|---|---|
| `normal` | Healthy / OK status. |
| `med` | Watch / elevated status. |
| `high` | Alert / hot reading. |
| `brand` | Connected Boots, Hot Horses, Phase 0 banner. |
| `neutral` (default) | Untagged / generic. |
| `info` | Generic info — rarely used. |

```tsx
<Pill intent="high" size="sm">2 Heat alerts</Pill>
<Pill intent="brand" leadingIcon={<BluetoothIcon />}>Connected Boots</Pill>
```

## Input

Text input with label, helper text, error state. Used in sign-up, profile creation, settings forms.

```tsx
<Input
  label="Horse Name"
  required
  placeholder="Type here"
  helperText="As shown on registration papers."
  value={name}
  onChangeText={setName}
  error={errors.name}
/>
```

## Card

Container surface. `filled` (default), `outlined`, or `flat`. Use `pressable` for tappable cards (horse cards on Home).

```tsx
<Card padding="lg" pressable onPress={() => router.push(`/horses/${id}`)}>
  …
</Card>
```

## Text — Heading / Body / Label / Caption

Semantic typography.

```tsx
<Heading level={2}>Buttercup</Heading>
<Body intent="secondary">Discipline · Jumping</Body>
<Label>FIELD LABEL</Label>
<Caption>184 sensors · May 11 2024</Caption>
```

## Modal & BottomSheet

Both built on Tamagui's `Sheet`. `Modal` is centered (default snap point 60%); `BottomSheet` anchors to the bottom with configurable snap points.

```tsx
<BottomSheet open={open} onOpenChange={setOpen} title="Filters" snapPoints={[40, 80]}>
  …filter UI…
</BottomSheet>
```

## Tabs

Horizontal underline tab bar.

```tsx
<Tabs
  items={[
    { key: 'activity', label: 'Activity' },
    { key: 'basic', label: 'Basic Info' },
    { key: 'manage', label: 'Manage Data' },
  ]}
  value={active}
  onChange={setActive}
/>
```

## Header

Screen header — back chevron + title + right action.

```tsx
<Header
  title="Buttercup"
  showBack
  onBack={router.back}
  rightAction={<Pill intent="brand" size="sm">Connected Boots</Pill>}
/>
```

## BottomNav

Four-tab bottom nav. Wireframes use Home / Quick Read / Alerts / Account.

```tsx
<BottomNav
  active={activeTab}
  onChange={setActiveTab}
  tabs={[
    { key: 'home', label: 'Home', icon: <HomeIcon /> },
    { key: 'quick', label: 'Quick Read', icon: <QuickReadIcon /> },
    { key: 'alerts', label: 'Alerts', icon: <BellIcon />, badge: 2 },
    { key: 'account', label: 'Account', icon: <UserIcon /> },
  ]}
/>
```

## Toggle

Accessible switch.

```tsx
<Toggle value={enabled} onChange={setEnabled} label="Hot Readings" />
```

## Anti-patterns

- ❌ Hard-coding colors / spacing in components instead of using tokens.
- ❌ Using `$tempHigh` (red) without a text label or icon (constitution N5.3).
- ❌ Components with `height < 44` for any interactive element.
- ❌ `<Text>` without one of the semantic wrappers (`Heading`/`Body`/`Label`/`Caption`).
- ❌ Adding a new component without a `.stories.tsx` file alongside it.

## Components not yet built (Phase 2)

| Component | Spec ref |
|---|---|
| `Gauge` (dual arc, 184-sensor proportions) | F7.1, T2.14 |
| `HeatMapCell` + `HeatMapGrid` | F7.2, T2.12 |
| `LegPicker` (FL/FR/BL/BR radio cluster) | F6.2 |
| `LegModel3D` (Three.js + R3F leg) | F7.3, T2.13 |
| `Calendar` (day/week/month/year) | F7.5, T2.17 |
| `StackedBar` (last-N readings visualization) | F7.5, T2.16 |
| `AlertCard` (alert feed item) | F8.6, T2.19 |
| `BootCard` (connected-boots list item) | F5.3, T2.24 |
