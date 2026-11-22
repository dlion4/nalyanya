"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, CalendarDays, CalendarPlus, Download, Ellipsis, Eye, Plus, Search, Trash, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, SectionHeader } from "@/components/ui/Primitives";
import {
  CAUSES,
  EVENT_KINDS,
  memberById,
  rsvpSummary,
  sortByStart,
  venueById,
  type EventKind,
  type FamilyEvent,
} from "@/data/dashboard/events";
import { BRANCHES } from "@/data/family/branches";
import { buildIcs, downloadText, eatLabel, shortDay, TODAY_ISO } from "@/lib/calendar";
import { cn } from "@/lib/format";
import { EventStatusChip, filterEvents, KindChip, RsvpMeter } from "@/views/dashboard/events/eventsUi";
import type { ActKind, EventsActions, EventsParams } from "@/views/dashboard/events/types";

const helper = createColumnHelper<FamilyEvent>();

interface MenuItemDef {
  act: ActKind;
  label: string;
  show: (e: FamilyEvent) => boolean;
  tone?: "danger";
}

const MENU_ITEMS: MenuItemDef[] = [
  { act: "edit", label: "Edit details", show: (e) => e.status !== "cancelled" },
  { act: "reschedule", label: "Reschedule", show: (e) => e.status === "scheduled" },
  { act: "rsvp", label: "RSVP manager", show: (e) => e.status !== "draft" },
  { act: "invite", label: "Send invites", show: (e) => e.status === "scheduled" },
  { act: "reminders", label: "Reminder rules", show: (e) => e.status === "scheduled" },
  { act: "cause", label: "Link contribution cause", show: (e) => e.status !== "draft" },
  { act: "album", label: "Attach album", show: (e) => e.status === "done" || e.status === "scheduled" },
  { act: "share", label: "Share link", show: () => true },
  { act: "ics", label: "Download .ics", show: () => true },
  { act: "cancel", label: "Cancel event…", show: (e) => e.status === "scheduled", tone: "danger" },
  { act: "delete", label: "Delete draft…", show: (e) => e.status === "draft", tone: "danger" },
];

export function EventsTable({ events, params, actions }: { events: FamilyEvent[]; params: EventsParams; actions: EventsActions }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: false }]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const filtered = useMemo(
    () => sortByStart(filterEvents(events, { q: params.q, kind: params.kind, status: params.status, branch: params.branch })),
    [events, params.q, params.kind, params.status, params.branch],
  );

  const columns = useMemo(
    () => [
      helper.display({
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            aria-label="Select all events on this page"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="size-4 accent-brand-primary"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label={`Select ${row.original.title}`}
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="size-4 accent-brand-primary"
          />
        ),
      }),
      helper.accessor("title", {
        header: "Event",
        cell: ({ row }) => {
          const e = row.original;
          return (
            <button type="button" onClick={() => actions.openEvent(e.id)} className="group flex items-center gap-3 text-left">
              <img src={e.cover} alt="" loading="lazy" decoding="async" className="size-12 shrink-0 rounded-2xl object-cover ring-2 ring-white" />
              <span className="min-w-0">
                <span
                  className={cn(
                    "block max-w-[16rem] truncate font-semibold text-text-primary group-hover:text-brand-primary group-hover:underline",
                    e.status === "cancelled" && "text-text-tertiary line-through",
                  )}
                >
                  {e.title}
                </span>
                <span className="block font-mono text-[11px] text-text-tertiary">{e.id}</span>
              </span>
            </button>
          );
        },
      }),
      helper.accessor("kind", {
        header: "Type",
        cell: ({ getValue }) => <KindChip kind={getValue() as EventKind} />,
      }),
      helper.accessor("date", {
        header: "Date · EAT",
        cell: ({ row }) => (
          <span className="block whitespace-nowrap">
            <span className="block font-semibold text-text-primary">{shortDay(row.original.date)}</span>
            <span className="block font-mono text-xs text-text-tertiary">
              {eatLabel(row.original.startTime)} – {row.original.endTime}
            </span>
          </span>
        ),
      }),
      helper.accessor((e) => venueById(e.venueId)?.name ?? "", {
        id: "venue",
        header: "Venue",
        cell: ({ row }) => {
          const v = venueById(row.original.venueId);
          return (
            <span className="block max-w-[11rem]">
              <span className="block truncate text-sm font-medium text-text-primary">{v?.name ?? "To confirm"}</span>
              <span className="block truncate text-xs text-text-tertiary">{v?.town} · {v?.county}</span>
            </span>
          );
        },
      }),
      helper.accessor("host", {
        header: "Host",
        cell: ({ getValue }) => {
          const m = memberById(getValue());
          if (!m) return <span className="text-xs text-text-tertiary">Family office</span>;
          return (
            <span className="flex items-center gap-2.5">
              <Avatar member={m} size={32} />
              <span className="block max-w-[8rem] truncate text-sm font-medium text-text-primary">{m.preferredName} {m.lastName}</span>
            </span>
          );
        },
      }),
      helper.display({
        id: "rsvp",
        header: "RSVPs",
        cell: ({ row }) => (row.original.status === "draft" ? <span className="text-xs text-text-tertiary">Not opened</span> : <RsvpMeter event={row.original} />),
      }),
      helper.accessor("causeId", {
        header: "Contribution",
        cell: ({ getValue }) => {
          const cause = CAUSES.find((c) => c.id === getValue());
          if (!cause) return <span className="text-xs text-text-tertiary">None linked</span>;
          const pct = Math.round((cause.raised / cause.target) * 100);
          return (
            <span className="block max-w-[10rem]">
              <span className="block truncate text-xs font-semibold text-text-primary">{cause.title}</span>
              <span className="ny-num text-[11px] text-brand-primary">{pct}% of target</span>
            </span>
          );
        },
      }),
      helper.accessor("status", {
        header: "Status",
        cell: ({ row }) => <EventStatusChip status={row.original.status} date={row.original.date} />,
      }),
      helper.display({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const e = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5">
              <button type="button" onClick={() => actions.openEvent(e.id)} className="ny-btn ny-btn-quiet ny-btn-sm !min-h-[32px] !px-2.5 text-xs">
                <Eye className="size-3.5" aria-hidden /> View
              </button>
              <Menu>
                <MenuButton aria-label={`Actions for ${e.title}`} className="grid size-8 place-items-center rounded-xl border border-hairline bg-surface-1 text-text-secondary transition hover:border-brand-primary hover:text-brand-primary">
                  <Ellipsis className="size-4" aria-hidden />
                </MenuButton>
                <MenuItems anchor="bottom end" className="z-50 mt-1.5 w-60 rounded-2xl border border-hairline bg-surface-1 p-1.5 shadow-lift focus:outline-none">
                  {MENU_ITEMS.filter((item) => item.show(e)).map((item) => (
                    <MenuItem key={item.act}>
                      {({ focus }) => (
                        <button
                          type="button"
                          onClick={() => {
                            if (item.act === "ics") {
                              downloadText(`${e.id}.ics`, buildIcs([{ id: e.id, title: e.title, date: e.date, startTime: e.startTime, endTime: e.endTime, location: venueById(e.venueId)?.name ?? "To confirm", description: e.description }], e.title));
                              actions.notify({ title: "Calendar file downloaded", body: `${e.title} · open it to add to your calendar.`, tone: "success" });
                              return;
                            }
                            actions.openAct(item.act, { event: e.id });
                          }}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm",
                            focus && "bg-surface-2",
                            item.tone === "danger" && "text-danger",
                          )}
                        >
                          {item.label}
                        </button>
                      )}
                    </MenuItem>
                  ))}
                </MenuItems>
              </Menu>
            </div>
          );
        },
      }),
    ],
    [actions],
  );

  const table = useReactTable({
    data: filtered,
    columns,
    getRowId: (row) => row.id,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);

  const exportSelected = () => {
    const chosen = events.filter((e) => selectedIds.includes(e.id));
    downloadText(
      "nalyanya-selected-events.ics",
      buildIcs(
        chosen.map((e) => ({ id: e.id, title: e.title, date: e.date, startTime: e.startTime, endTime: e.endTime, location: venueById(e.venueId)?.name ?? "To confirm", description: e.description })),
        "Nalyanya selected events",
      ),
    );
    actions.notify({ title: `${chosen.length} events exported`, body: "One .ics file with every selected gathering (EAT).", tone: "success" });
  };

  return (
    <section id="table" aria-labelledby="table-heading" className="scroll-mt-24 space-y-6">
      <SectionHeader
        eyebrow="S3 · Events table"
        title="Every gathering, sortable and actionable"
        description="Sort by date, filter by type or branch, select several events for one calendar file, or open any row in the detail drawer."
        actions={
          <button type="button" onClick={() => actions.openAct("create")} className="ny-btn ny-btn-primary">
            <Plus className="size-4" aria-hidden />
            New event
          </button>
        }
      />
      <h2 id="table-heading" className="sr-only">Events table</h2>

      <div className="ny-card space-y-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search events</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" aria-hidden />
            <input
              type="search"
              value={params.q}
              onChange={(e) => actions.setParams({ q: e.target.value }, "replace")}
              placeholder="Search title, event ID, type or description…"
              className="ny-input pl-11"
            />
          </label>
          <div className="grid gap-2 sm:grid-cols-3 lg:w-[38rem]">
            <select aria-label="Filter by type" value={params.kind} onChange={(e) => actions.setParams({ kind: e.target.value }, "replace")} className="ny-input !min-h-[44px] text-sm">
              <option value="all">All types</option>
              {EVENT_KINDS.map((k) => (
                <option key={k.kind} value={k.kind}>{k.kind}</option>
              ))}
            </select>
            <select aria-label="Filter by status" value={params.status} onChange={(e) => actions.setParams({ status: e.target.value }, "replace")} className="ny-input !min-h-[44px] text-sm">
              <option value="all">Any status</option>
              <option value="scheduled">Scheduled</option>
              <option value="done">Held</option>
              <option value="cancelled">Cancelled</option>
              <option value="draft">Draft</option>
            </select>
            <select aria-label="Filter by branch" value={params.branch} onChange={(e) => actions.setParams({ branch: e.target.value }, "replace")} className="ny-input !min-h-[44px] text-sm">
              <option value="all">All branches</option>
              {BRANCHES.map((b) => (
                <option key={b.id} value={b.id}>{b.shortName} · {b.county}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-text-secondary">
          <p>
            Showing <span className="ny-num font-semibold text-text-primary">{filtered.length}</span> of{" "}
            <span className="ny-num font-semibold text-text-primary">{events.length}</span> events
          </p>
          {(params.q || params.kind !== "all" || params.status !== "all" || params.branch !== "all") && (
            <button
              type="button"
              onClick={() => actions.setParams({ q: null, kind: null, status: null, branch: null }, "replace")}
              className="ny-btn ny-btn-ghost ny-btn-sm"
            >
              <X className="size-3.5" aria-hidden /> Clear filters
            </button>
          )}
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="ny-bulk-hud sticky top-20 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 text-white">
          <p className="text-sm font-semibold">{selectedIds.length} selected</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={exportSelected} className="ny-btn ny-btn-gold ny-btn-sm">
              <Download className="size-3.5" aria-hidden /> Download .ics for selected
            </button>
            <button type="button" onClick={() => setRowSelection({})} aria-label="Clear selection" className="ny-btn ny-btn-dark ny-btn-sm size-9 p-0">
              <X className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="ny-card grid place-items-center gap-3 p-10 text-center">
          <CalendarDays className="size-10 text-brand-primary" aria-hidden />
          <h3 className="ny-title text-2xl">No gathering matches those filters</h3>
          <p className="max-w-md text-sm text-text-secondary">Try a shorter search, or plan something new for this season.</p>
          <button type="button" onClick={() => actions.setParams({ q: null, kind: null, status: null, branch: null }, "replace")} className="ny-btn ny-btn-primary">
            Reset filters
          </button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="ny-card hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[68rem] text-left text-sm">
                <caption className="sr-only">Family events with date, venue, host, RSVPs and status</caption>
                <thead className="border-b border-hairline bg-surface-0/80 text-xs uppercase tracking-[0.1em] text-text-tertiary">
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id}>
                      {hg.headers.map((header) => (
                        <th key={header.id} scope="col" className="px-3 py-3.5 first:pl-5 last:pr-5 font-semibold">
                          {header.isPlaceholder ? null : header.column.getCanSort() ? (
                            <button type="button" onClick={header.column.getToggleSortingHandler()} className="inline-flex items-center gap-1.5 transition hover:text-brand-primary">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              <ArrowUpDown className="size-3 opacity-60" aria-hidden />
                            </button>
                          ) : (
                            flexRender(header.column.columnDef.header, header.getContext())
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-hairline">
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className={cn(
                        "transition hover:bg-surface-0/75",
                        row.getIsSelected() && "bg-brand-accent-soft/35",
                        row.original.date === TODAY_ISO && "bg-brand-accent-soft/20",
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-3 py-3.5 first:pl-5 last:pr-5 align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {table.getRowModel().rows.map((row) => {
              const e = row.original;
              const s = rsvpSummary(e);
              return (
                <li key={row.id} className="ny-card p-4">
                  <button type="button" onClick={() => actions.openEvent(e.id)} className="flex w-full items-start gap-3 text-left">
                    <img src={e.cover} alt="" loading="lazy" decoding="async" className="size-16 shrink-0 rounded-2xl object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <KindChip kind={e.kind} />
                        <EventStatusChip status={e.status} date={e.date} />
                      </span>
                      <span className="mt-1.5 block font-semibold leading-snug text-text-primary">{e.title}</span>
                      <span className="block text-xs text-text-tertiary">
                        {shortDay(e.date)} · {eatLabel(e.startTime)} · {venueById(e.venueId)?.town}
                      </span>
                    </span>
                  </button>
                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-hairline pt-3 text-xs">
                    <span className="ny-num text-text-secondary">{s.going} going · {s.pending} waiting</span>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => actions.openAct("rsvp", { event: e.id })} className="ny-btn ny-btn-ghost ny-btn-sm">RSVPs</button>
                      <button type="button" onClick={() => actions.openAct("edit", { event: e.id })} className="ny-btn ny-btn-primary ny-btn-sm">Edit</button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="ny-card flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-sm">
            <div className="flex items-center gap-2 text-text-secondary">
              <span>Rows per page</span>
              <select
                aria-label="Rows per page"
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="rounded-xl border border-hairline bg-surface-0 px-2.5 py-1.5 text-xs font-semibold"
              >
                {[8, 16, 24].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <p className="ny-num text-xs font-semibold text-text-secondary">
              Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
            </p>
            <div className="flex gap-1.5">
              <button type="button" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="ny-btn ny-btn-ghost ny-btn-sm">Previous</button>
              <button type="button" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="ny-btn ny-btn-ghost ny-btn-sm">Next</button>
            </div>
          </div>
        </>
      )}

      <p className="flex items-center gap-2 text-xs text-text-tertiary">
        <CalendarPlus className="size-3.5" aria-hidden />
        Tip: branch filters match the twelve branches in the family tree. Scheduled events sort first within each day.
      </p>
    </section>
  );
}
