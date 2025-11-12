# 🎨 AjiApp Admin - Design System

## Vue d'ensemble

Design system moderne et minimaliste construit avec **React**, **TypeScript** et **Tailwind CSS**.

---

## 🎯 Principes de design

1. **Minimal et cohérent** - Interface épurée et professionnelle
2. **Responsive** - Fonctionne sur tous les appareils
3. **Accessible** - Focus sur l'expérience utilisateur
4. **Performant** - Animations fluides et chargement rapide
5. **Maintenable** - Code propre et réutilisable

---

## 🎨 Palette de couleurs

### Primary (Bleu)
- `primary-50` à `primary-950` - Couleur principale de l'application
- Utilisée pour les CTAs, liens, et éléments interactifs

### Secondary (Gris)
- `secondary-50` à `secondary-950` - Couleur secondaire
- Utilisée pour le texte, bordures, et fonds

### Semantic Colors
- **Success**: `success-500` (Vert) - Actions positives
- **Danger**: `danger-500` (Rouge) - Actions destructives
- **Warning**: `warning-500` (Orange) - Avertissements

---

## 🧩 Composants UI

### Button

```tsx
import Button from '../components/Button'

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="success">Success</Button>
<Button variant="danger">Danger</Button>
<Button variant="ghost">Ghost</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// States
<Button loading>Loading...</Button>
<Button disabled>Disabled</Button>

// With icon
<Button icon={<PlusIcon />}>Add Item</Button>
```

### Card

```tsx
import Card, { CardHeader, CardFooter } from '../components/Card'

<Card>
  <CardHeader 
    title="Card Title" 
    subtitle="Optional subtitle"
    action={<Button>Action</Button>}
  />
  
  <div>Card content goes here</div>
  
  <CardFooter>
    <Button variant="secondary">Cancel</Button>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

### Input

```tsx
import Input from '../components/Input'

<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  error="Invalid email"
  hint="We'll never share your email"
  leftIcon={<MailIcon />}
  rightIcon={<CheckIcon />}
  required
/>
```

### Select

```tsx
import Select from '../components/Select'

<Select
  label="City"
  placeholder="Select a city"
  options={[
    { value: '1', label: 'Casablanca' },
    { value: '2', label: 'Rabat' },
  ]}
  required
/>
```

### Textarea

```tsx
import Textarea from '../components/Textarea'

<Textarea
  label="Description"
  placeholder="Enter description"
  rows={4}
  required
/>
```

### Badge

```tsx
import Badge from '../components/Badge'

// Variants
<Badge variant="success">Active</Badge>
<Badge variant="danger">Inactive</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="info">Info</Badge>

// With dot
<Badge variant="success" dot>Active</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
```

### Table

```tsx
import Table from '../components/Table'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { 
    key: 'status', 
    label: 'Status',
    render: (value) => <Badge>{value}</Badge>
  },
]

<Table
  columns={columns}
  data={users}
  keyExtractor={(user) => user.id}
  onRowClick={(user) => navigate(`/users/${user.id}`)}
  emptyMessage="No users found"
/>
```

### Modal

```tsx
import Modal, { ConfirmModal } from '../components/Modal'

// Standard Modal
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="lg"
  footer={
    <>
      <Button variant="secondary">Cancel</Button>
      <Button>Confirm</Button>
    </>
  }
>
  Modal content
</Modal>

// Confirm Modal
<ConfirmModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  title="Delete Item"
  message="Are you sure?"
  variant="danger"
  loading={loading}
/>
```

### Alert

```tsx
import Alert from '../components/Alert'

<Alert variant="success" title="Success!">
  Your changes have been saved.
</Alert>

<Alert variant="danger" onClose={() => setError(null)}>
  An error occurred.
</Alert>
```

### Loading

```tsx
import Loading, { LoadingOverlay, TableSkeleton } from '../components/Loading'

// Standard loading
<Loading text="Loading..." />

// Full screen
<Loading size="lg" fullScreen />

// Overlay
<LoadingOverlay text="Saving..." />

// Table skeleton
<TableSkeleton rows={5} columns={4} />
```

### EmptyState

```tsx
import EmptyState from '../components/EmptyState'

<EmptyState
  title="No items found"
  description="Get started by creating a new item"
  action={{
    label: 'Create Item',
    onClick: () => navigate('/items/new')
  }}
/>
```

---

## 📐 Layout

### AdminLayout

Le layout principal avec sidebar responsive :

```tsx
import AdminLayout from '../layout/AdminLayout'

// Dans App.tsx
<Route path="/" element={<AdminLayout />}>
  <Route path="dashboard" element={<Dashboard />} />
  {/* ... autres routes */}
</Route>
```

**Features:**
- Sidebar responsive avec menu de navigation
- Header fixe avec déconnexion
- Collapse automatique sur mobile
- Indicateur de page active

---

## 📄 Pages types

### Liste (List Page)

```tsx
export default function ItemsList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card>
        <CardHeader
          title="Items"
          subtitle={`${items.length} item(s)`}
          action={<Button>New Item</Button>}
        />
        
        {loading ? (
          <Loading />
        ) : items.length === 0 ? (
          <EmptyState title="No items" />
        ) : (
          <Table columns={columns} data={items} />
        )}
      </Card>
    </div>
  )
}
```

### Formulaire (Form Page)

```tsx
export default function ItemForm() {
  const [formData, setFormData] = useState({})
  const [saving, setSaving] = useState(false)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader title="New Item" />
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Name" required />
          <Textarea label="Description" />
          <Select label="Category" options={[]} />
          
          <div className="flex gap-3 pt-6 border-t">
            <Button type="submit" loading={saving}>Save</Button>
            <Button variant="secondary">Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
```

### Détail (Detail Page)

```tsx
export default function ItemDetail() {
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader
          title="Item Details"
          action={
            <div className="flex gap-3">
              <Button variant="secondary">Edit</Button>
              <Button variant="danger">Delete</Button>
            </div>
          }
        />
        
        {loading ? (
          <Loading />
        ) : (
          <div className="space-y-6">
            {/* Display fields */}
          </div>
        )}
      </Card>
    </div>
  )
}
```

---

## 🎭 Animations

Animations Tailwind personnalisées :

```css
/* Défini dans tailwind.config.cjs */
animate-fadeIn      /* Fade in douce */
animate-scaleIn     /* Scale avec fade */
animate-slideDown   /* Slide depuis le haut */
animate-slideUp     /* Slide depuis le bas */
animate-slideInRight /* Slide depuis la droite */
```

---

## 📦 Structure du projet

```
src/
├── api/              # Appels API
├── components/       # Composants réutilisables
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── ...
├── layout/           # Layouts
│   └── AdminLayout.tsx
├── pages/            # Pages
│   ├── Dashboard.tsx
│   ├── CitiesList.tsx
│   ├── CityForm.tsx
│   └── ...
├── types/            # Types TypeScript
│   └── index.ts
├── lib/              # Utilitaires
│   ├── auth.ts
│   ├── http.ts
│   └── utils.ts
├── App.tsx
└── main.tsx
```

---

## 🚀 Best Practices

1. **Composants réutilisables** - Utiliser les composants UI existants
2. **TypeScript strict** - Toujours typer vos props et états
3. **Gestion d'erreurs** - Afficher des messages clairs à l'utilisateur
4. **Loading states** - Indiquer le chargement des données
5. **Empty states** - Gérer l'absence de données
6. **Responsive** - Tester sur mobile et desktop
7. **Accessibility** - Labels, ARIA, focus states
8. **Consistent spacing** - Utiliser `space-y-6` pour les sections

---

## 📱 Responsive Design

### Breakpoints Tailwind

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Exemple d'utilisation

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards responsive */}
</div>
```

---

## 🎨 Exemples complets

Voir les pages existantes pour des exemples complets :
- **CitiesList.tsx** - Page liste avec table
- **CityForm.tsx** - Formulaire avec traductions
- **CityDetail.tsx** - Page de détail
- **Dashboard.tsx** - Dashboard avec statistiques
- **Login.tsx** - Page de connexion

---

## 📚 Ressources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Heroicons](https://heroicons.com/) - Icons utilisés

