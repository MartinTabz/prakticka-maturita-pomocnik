
# Praktická Maturita - Pomocník

Tento projekt sloužil pro zobrazování pomocných informací při skládání praktické maturity. Je to pouze kostra, která dokáže zobrazovat informace ze Supabase databáze.

Aplikace je propojena se Stripe pro získávání plateb od zájemců (nebylo využito - v kódu je platební brána odstavena pro platby pouze v hotovosti).


## Dělení
Aplikace se dělí na následující 3 části:\
1: Produkty\
2: Předměty\
3: Kapitoly + SQL Builder

Produktů může být libovolný počet. Každý produkt může mít libovolný počet předmětů. Každý předmět může mít libovolný počet kapitol. Produkty a předměty mají svoje dynamické stránky, ale kapitoly se všechny ukazují na jedné stránce a je možné mezi nimi přepínat.

SQL Builder je stránka, na které je možné naklikat svoje databázové schéma a další požadavky zadání => při odeslání požadavku je pomocí OpenAI API vytvořen SQL dotaz na základě požadavků. Koncový bod, který komunikuje s OpenAI API je chráněný limiterem dotazů (10 dotazů za 15 vteřin).



## Uživatelské účty
Pro přiřazení zakoupeného produktu k uživateli je potřeba mít vytvořený účet. Do aplikace je možné se registrovat a přihlásit přes poskytovatele 3. strany - OAuth GitHub (konfigurováno v Supabase)
## Pokuty

Pokud některý ze spolužáků dluží ze školních roků nějaké peníze je možné jim udělit pokutu, která je nepustí dovnitř produktu. 
# Databázové schéma

## Tabulka kapitol
```sql
  create table
  public.chapter (
    id uuid not null default gen_random_uuid (),
    created_at timestamp with time zone not null default now(),
    name text not null,
    description text null,
    html text null,
    subject_id uuid not null default gen_random_uuid (),
    rank integer not null default 1,
    unlocks timestamp with time zone null,
    constraint chapter_pkey primary key (id),
    constraint public_chapter_subject_id_fkey foreign key (subject_id) references subject (id)
  ) tablespace pg_default;
```

## Tabulka pokut
```sql
  create table
  public.fine (
    id uuid not null default gen_random_uuid (),
    created_at timestamp with time zone not null default now(),
    profile_id uuid not null default gen_random_uuid (),
    stripe_price text not null,
    description text null,
    constraint fine_pkey primary key (id),
    constraint fine_profile_id_key unique (profile_id),
    constraint public_fine_profile_id_fkey foreign key (profile_id) references profile (id)
  ) tablespace pg_default;
```

## Tabulka produktů
```sql
create table
  public.product (
    id uuid not null default gen_random_uuid (),
    created_at timestamp with time zone not null default now(),
    stripe_product text not null,
    name text not null,
    active boolean not null default false,
    slug text not null default ''::text,
    description text null,
    image text null,
    constraint product_pkey primary key (id),
    constraint product_name_key unique (name),
    constraint product_slug_key unique (slug),
    constraint product_stripe_product_key unique (stripe_product)
  ) tablespace pg_default;
```

## Tabulka profilů
```sql
create table
  public.profile (
    id uuid not null default gen_random_uuid (),
    created_at timestamp with time zone not null default now(),
    name text null,
    email text null,
    stripe_customer text null,
    username text null,
    admin boolean not null default false,
    constraint profile_pkey primary key (id),
    constraint public_profile_id_fkey foreign key (id) references auth.users (id)
  ) tablespace pg_default;
```

## Tabulka nákupů
```sql
create table
  public.purchase (
    product_id uuid not null default gen_random_uuid (),
    profile_id uuid not null default gen_random_uuid (),
    created_at timestamp with time zone not null default now(),
    active boolean not null default true,
    uses integer not null default 50,
    constraint purchase_pkey primary key (product_id, profile_id),
    constraint public_order_product_id_fkey foreign key (product_id) references product (id),
    constraint public_order_profile_id_fkey foreign key (profile_id) references profile (id)
  ) tablespace pg_default;
```

## Tabulka předmětů
```sql
create table
  public.subject (
    id uuid not null default gen_random_uuid (),
    created_at timestamp with time zone not null default now(),
    name text null,
    description text null,
    image text null,
    product_id uuid not null,
    slug text not null default 'pva'::text,
    constraint subject_pkey primary key (id),
    constraint subject_slug_key unique (slug),
    constraint public_subject_product_id_fkey foreign key (product_id) references product (id)
  ) tablespace pg_default;
```


## RLS (Row-Level Security) Pravidla

Databáze samozřejmě musí být zabezpečená, aby se k datům nedostal někdo, kdo nemá koupený produkt. K tomu u Supabase slouží RLS pravidla.

Zapnutí RLS na všech tabulkách:
```sql
alter table public.chapter
  enable row level security;
alter table public.fine
  enable row level security;
alter table public.product
  enable row level security;
alter table public.profile
  enable row level security;
alter table public.purchase
  enable row level security;
alter table public.subject
  enable row level security;
```

### Tabulka kapitol
Name: Enable insert for admin users only
Policy Command: UPDATE
Target Roles: authenticated
```sql
 (EXISTS ( SELECT 1
   FROM profile
  WHERE ((profile.id = auth.uid()) AND (profile.admin = true))))
```

Name: Users can select chapters of a product that they bought
Policy Command: SELECT
Target Roles: authenticated
```sql
 (EXISTS ( SELECT 1
   FROM (purchase p
     JOIN subject s ON ((p.product_id = s.product_id)))
  WHERE ((s.id = chapter.subject_id) AND (p.profile_id = auth.uid()))))
```

### Tabulka pokut
Name: Users can select their fine
Policy Command: SELECT
Target Roles: authenticated
```sql
  (auth.uid() = profile_id)
```

### Tabulka produktů
Name: Enable read access for all users
Policy Command: SELECT
```sql
  true
```

### Tabulka profilů
Name: Users can select their profile
Policy Command: SELECT
Target Roles: authenticated
```sql
 (auth.uid() = id)
```

### Tabulka nákupů
Name: Users can select their own orders
Policy Command: SELECT
Target Roles: authenticated
```sql
 (auth.uid() = profile_id)
```

### Tabulka předmětl
Name: Users can select subjects of a product that they bought
Policy Command: SELECT
Target Roles: authenticated
```sql
  (EXISTS ( SELECT 1
   FROM purchase
  WHERE ((subject.product_id = purchase.product_id) AND (auth.uid() = purchase.profile_id))))
```
## Instalace

Pro reinstalaci aplikace je nutné několik kroků, ale jsem líný je zde popisovat do detailu, takže zkráceně:

Prvně je potřeba vytvořit novou Supabase instanci. 
Vytvořit novou aplikaci v GitHubu a připojit její OAuth k Supabase - podle návodu online (například od Supabase). 

Dále je potřeba v Supabase vytvořit tabulku profilů. Po ní vytvořit funkci a trigger, který společně při prvním přihlášení uživatele vytvoří uživateli profil:

Funkce:
Name: create_new_profile
Return type: trigger
Definition:
```sql
begin
  insert into public.profile(id, name, email, username)
  values(new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'user_name');

  return new;
end;
```
Show advanced settings: ON => SECURITY DEFINER

Trigger (Nutnost udělat v SQL Editoru):
```sql
create trigger create_new_profile_for_user
  after insert on auth.users
  for each row execute procedure public.create_profile_for_user();
```

Nyní je potřeba vytvořit Stripe účet a podle .env.exaple vložit API klíče do .env.local. Dále musíme vytvořit Supabase webhook, který při registraci nového uživatele zavolá na backend webové aplikace a vytvoří ve Stripe nového zákazníka:

Dotaz je možné vytvořit v SQL Editoru, nebo přes UI. Místo domény priklad.cz je nutno vložit nějakou veřejně dostupnou destinaci - je potřeba aplikaci hostovat. Taky namísto klic u API_ROUTE_SECRET je potreba si vytvorit tajný klíč, který se potom také musí vložit do .env.local podle .env.example.

Příklad generování:
```bash
node -e "console.log(crypto.randomBytes(32).toString('hex'))"
```
Zde je příklad přes SQL Editor:
```sql
create trigger get_stripe_customer
after insert on profile for each row
execute function supabase_functions.http_request (
  'https://priklad.cz/api/create-stripe-customer',
  'POST',
  '{"Content-type":"application/json"}',
  '{"API_ROUTE_SECRET":"klic"}',
  '1000'
);
```
