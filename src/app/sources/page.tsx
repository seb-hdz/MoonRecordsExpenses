"use client";

import type { ReactNode, RefObject } from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import { Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ALL_SOURCE_SORT_OPTIONS,
  NonSharedTypeFilterSelect,
  SortOrderSelect,
  SOURCE_SORT_LABELS,
  type NonSharedTypeFilter,
  type SourceSort,
} from "@/components/sources-filter-selects";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SourceCard } from "@/components/source-card";
import { SourceForm } from "@/components/source-form";
import {
  useSources,
  useExpensesInInterval,
  useGlobalConfig,
  deleteSource,
} from "@/lib/db-hooks";
import type { Expense, Source } from "@/lib/types";
import { SOURCE_TYPE_LABELS } from "@/lib/types";

function useFocusInputWhen(
  ref: RefObject<HTMLInputElement | null>,
  when: boolean
) {
  useEffect(() => {
    if (when) ref.current?.focus();
  }, [when, ref]);
}

function SourceSectionFilterHeader({
  leading,
  children,
}: {
  leading: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between md:gap-x-4">
      {leading}
      <div className="flex min-[410px]:flex-row w-full min-w-0 gap-2 items-center md:w-auto md:shrink-0 md:justify-end justify-between">
        {children}
      </div>
    </div>
  );
}

type SourceSectionSearchConfig = {
  open: boolean;
  query: string;
  onQueryChange: (q: string) => void;
  onOpen: () => void;
  onClose: () => void;
  inputRef: RefObject<HTMLInputElement | null>;
  placeholder: string;
  inputAriaLabel: string;
  openButtonAriaLabel: string;
  closeButtonAriaLabel: string;
};

function SourceSectionFilters({
  leading,
  middleControls,
  search,
}: {
  leading: ReactNode;
  middleControls: ReactNode;
  search: SourceSectionSearchConfig;
}) {
  const {
    inputRef,
    open: searchOpen,
    query: searchQuery,
    onQueryChange,
    onOpen: onSearchOpen,
    onClose: onSearchClose,
    placeholder: searchPlaceholder,
    inputAriaLabel,
    openButtonAriaLabel,
    closeButtonAriaLabel,
  } = search;

  useFocusInputWhen(inputRef, searchOpen);

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 min-[410px]:hidden">
        {leading}
        <div className="flex w-full min-w-0 items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              className="w-full min-w-0 py-4 pl-9"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onQueryChange(e.target.value)}
              aria-label={inputAriaLabel}
            />
          </div>
          {searchQuery.trim() ? (
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              aria-label="Limpiar búsqueda"
              onClick={() => onQueryChange("")}
            >
              <X className="size-4" />
            </Button>
          ) : null}
        </div>
        <div className="flex w-full min-w-0 flex-col gap-2 min-[410px]:flex-row min-[410px]:flex-wrap min-[410px]:items-center max-[409px]:items-stretch max-[409px]:[&>*]:w-full min-[410px]:[&>*]:w-auto">
          {middleControls}
        </div>
      </div>

      <div className="hidden min-[410px]:block space-y-2">
        <SourceSectionFilterHeader leading={leading}>
          {middleControls}
          {!searchOpen ? (
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              aria-label={openButtonAriaLabel}
              onClick={onSearchOpen}
            >
              <Search className="size-4" />
            </Button>
          ) : null}
        </SourceSectionFilterHeader>
        {searchOpen ? (
          <div className="flex w-full min-w-0 animate-in fade-in-0 slide-in-from-top-2 duration-200 motion-reduce:translate-y-0 motion-reduce:animate-none motion-reduce:opacity-100 items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                ref={inputRef}
                className="w-full min-w-0 py-4 pl-9 text-sm"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onQueryChange(e.target.value)}
                aria-label={inputAriaLabel}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              aria-label={closeButtonAriaLabel}
              onClick={onSearchClose}
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function expenseTotalsBySourceId(expenses: Expense[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const e of expenses) {
    m.set(e.sourceId, (m.get(e.sourceId) ?? 0) + e.amount);
  }
  return m;
}

function sourceMatchesQuery(source: Source, q: string): boolean {
  const n = q.trim().toLowerCase();
  if (!n) return true;
  return source.name.toLowerCase().includes(n);
}

function sortSourcesList(
  list: Source[],
  sort: SourceSort,
  totals: Map<string, number>
): Source[] {
  const out = [...list];
  switch (sort) {
    case "created":
      out.sort((a, b) => b.createdAt - a.createdAt);
      break;
    case "expenses_desc":
      out.sort((a, b) => (totals.get(b.id) ?? 0) - (totals.get(a.id) ?? 0));
      break;
    case "expenses_asc":
      out.sort((a, b) => (totals.get(a.id) ?? 0) - (totals.get(b.id) ?? 0));
      break;
    case "name":
      out.sort((a, b) => a.name.localeCompare(b.name, "es"));
      break;
    case "type":
      out.sort((a, b) => {
        const byLabel = SOURCE_TYPE_LABELS[a.type].localeCompare(
          SOURCE_TYPE_LABELS[b.type],
          "es"
        );
        return byLabel !== 0 ? byLabel : a.name.localeCompare(b.name, "es");
      });
      break;
    default:
      break;
  }
  return out;
}

export default function SourcesPage() {
  const sources = useSources();
  const config = useGlobalConfig();
  const expenses = useExpensesInInterval(config?.limitInterval ?? "monthly");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Source | undefined>();
  const [deleting, setDeleting] = useState<Source | undefined>();

  const [otherSearchOpen, setOtherSearchOpen] = useState(false);
  const [otherSearch, setOtherSearch] = useState("");
  const [otherTypeFilter, setOtherTypeFilter] =
    useState<NonSharedTypeFilter>("all");
  const [otherSort, setOtherSort] = useState<SourceSort>("created");

  const otherSearchInputRef = useRef<HTMLInputElement>(null);

  const totals = useMemo(() => expenseTotalsBySourceId(expenses), [expenses]);

  const otherSourcesRaw = useMemo(
    () => sources.filter((s) => s.type !== "shared"),
    [sources]
  );

  const otherSources = useMemo(() => {
    let list = otherSourcesRaw;
    if (otherTypeFilter !== "all") {
      list = list.filter((s) => s.type === otherTypeFilter);
    }
    list = list.filter((s) => sourceMatchesQuery(s, otherSearch));
    return sortSourcesList(list, otherSort, totals);
  }, [otherSourcesRaw, otherTypeFilter, otherSearch, otherSort, totals]);

  function handleEdit(source: Source) {
    setEditing(source);
    setFormOpen(true);
  }

  function handleNew() {
    setEditing(undefined);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteSource(deleting.id);
      toast.success("Cuenta eliminada");
    } catch (err) {
      toast.error((err as Error).message);
    }
    setDeleting(undefined);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cuentas</h1>
          <p className="text-sm text-muted-foreground">
            Administra tus cuentas, tarjetas y monederos digitales
          </p>
        </div>
        <Button className="mt-2 md:mt-0" onClick={handleNew} size="sm">
          <Plus className="size-4 mr-1" />
          Nueva
        </Button>
      </div>

      {otherSourcesRaw.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No hay cuentas configuradas.</p>
          <Button variant="outline" className="mt-4" onClick={handleNew}>
            Crear primera cuenta
          </Button>
        </div>
      ) : (
        <section className="space-y-3">
          <SourceSectionFilters
            leading={
              <h2 className="text-lg font-semibold tracking-tight md:min-w-0">
                Mis cuentas
              </h2>
            }
            middleControls={
              <div className="flex w-full min-w-0 flex-col gap-2 max-[409px]:items-stretch max-[409px]:[&>*]:w-full min-[410px]:flex-row min-[410px]:items-center min-[410px]:[&>*]:w-auto">
                <NonSharedTypeFilterSelect
                  value={otherTypeFilter}
                  onValueChange={setOtherTypeFilter}
                />
                <SortOrderSelect
                  value={otherSort}
                  optionKeys={ALL_SOURCE_SORT_OPTIONS}
                  labels={SOURCE_SORT_LABELS}
                  onValueChange={setOtherSort}
                />
              </div>
            }
            search={{
              open: otherSearchOpen,
              query: otherSearch,
              onQueryChange: setOtherSearch,
              onOpen: () => setOtherSearchOpen(true),
              onClose: () => {
                setOtherSearch("");
                setOtherSearchOpen(false);
              },
              inputRef: otherSearchInputRef,
              placeholder: "Buscar por nombre…",
              inputAriaLabel: "Buscar cuentas",
              openButtonAriaLabel: "Buscar cuentas",
              closeButtonAriaLabel: "Cerrar búsqueda",
            }}
          />
          {otherSources.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ninguna cuenta coincide con los filtros.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {otherSources.map((source) => (
                <SourceCard
                  key={source.id}
                  source={source}
                  expenses={expenses}
                  config={config}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </section>
      )}

      <SourceForm
        key={`${editing?.id ?? "new"}-${formOpen}`}
        open={formOpen}
        onOpenChange={setFormOpen}
        source={editing}
        onDeleteRequest={setDeleting}
      />

      <AlertDialog
        open={!!deleting}
        onOpenChange={() => setDeleting(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cuenta?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará &quot;{deleting?.name}&quot;. Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
